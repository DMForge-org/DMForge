// AES-256-GCM at-rest encryption for credentials stored in Firestore.
// Shared by every channel that stores a secret (email, SMS, Instagram, Messenger, GHL).
//
// ── Ciphertext format ────────────────────────────────────────────────────
// Legacy (no marker):   base64(iv[12] || tag[16] || ciphertext)
//   This is what every pre-rotation record in Firestore looks like today —
//   a bare base64 string with no prefix, encrypted with whatever value
//   ENCRYPTION_KEY held at the time.
// Versioned (current):  "v1:" + base64(iv[12] || tag[16] || ciphertext)
//   Same byte layout, just prefixed. The prefix is unambiguous: base64
//   output only ever contains [A-Za-z0-9+/=], and never a ':'. A legacy
//   value can therefore never accidentally start with "v1:", so a plain
//   `startsWith` check reliably tells the two formats apart with zero risk
//   of misparsing old data. (Future format changes can bump this to "v2:"
//   etc. without breaking the ability to detect legacy/older payloads.)
//
// ── Key rotation ─────────────────────────────────────────────────────────
// ENCRYPTION_KEY is always used to *encrypt*. To rotate without bricking
// existing credentials:
//   1. Copy the current ENCRYPTION_KEY value into ENCRYPTION_KEY_PREVIOUS.
//   2. Set ENCRYPTION_KEY to the new value.
//   3. Deploy. decrypt() tries ENCRYPTION_KEY first; if that fails (GCM
//      auth-tag mismatch — i.e. wrong key) and ENCRYPTION_KEY_PREVIOUS is
//      set, it retries with that. This covers both legacy and versioned
//      ciphertext produced under the old key.
//   4. Once nothing is decrypting via the previous-key fallback anymore
//      (all credentials have been re-saved / lazily re-encrypted under the
//      new key on a decrypt-then-store path), ENCRYPTION_KEY_PREVIOUS can
//      be removed. This module does not run a migration/batch job — that
//      is a separate, explicit task.
import crypto from 'crypto'

const VERSION_PREFIX = 'v1:'

function deriveKey(rawKey) {
  // sha256 so any-length input env var still yields a valid 32-byte AES-256 key.
  return crypto.createHash('sha256').update(rawKey).digest()
}

// Env values pasted with surrounding quotes or a trailing newline would
// otherwise derive a different key. Trim first: `$` doesn't match before a
// trailing newline.
function cleanSecret(value) {
  return value.trim().replace(/^["']|["']$/g, '')
}

// Keys are read per-call (not cached at module scope) — required for the
// serverless deployment model, where the build must succeed with no env
// vars set and env vars may change between invocations.
function getCurrentKey() {
  const key = process.env.ENCRYPTION_KEY
  if (!key) throw new Error('ENCRYPTION_KEY is not set')
  return deriveKey(cleanSecret(key))
}

// Decrypt candidates, in order: current key, then the raw (unsanitized)
// current value for records written before keys were sanitized, then the
// previous key (sanitized and raw) for rotation.
function getDecryptKeys() {
  const current = process.env.ENCRYPTION_KEY
  if (!current) throw new Error('ENCRYPTION_KEY is not set')
  const previous = process.env.ENCRYPTION_KEY_PREVIOUS
  const rawKeys = [cleanSecret(current), current]
  if (previous) rawKeys.push(cleanSecret(previous), previous)
  return [...new Set(rawKeys)].map(deriveKey)
}

function packAndEncrypt(plaintext, key) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, enc]).toString('base64')
}

function unpackAndDecrypt(buf, key) {
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const enc = buf.subarray(28)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8')
}

export function encrypt(plaintext) {
  // Always written in the current versioned format, under the current key.
  return VERSION_PREFIX + packAndEncrypt(plaintext, getCurrentKey())
}

export function decrypt(payload) {
  const isVersioned = payload.startsWith(VERSION_PREFIX)
  const b64 = isVersioned ? payload.slice(VERSION_PREFIX.length) : payload
  const buf = Buffer.from(b64, 'base64')

  let lastError
  for (const key of getDecryptKeys()) {
    try {
      return unpackAndDecrypt(buf, key)
    } catch (err) {
      lastError = err
    }
  }
  throw lastError
}
