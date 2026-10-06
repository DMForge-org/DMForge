import crypto from 'crypto'
import { encrypt, decrypt } from './encryption'

function legacyEncrypt(plaintext, rawKey) {
  const key = crypto.createHash('sha256').update(rawKey).digest()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString('base64')
}

describe('encryption key handling', () => {
  afterEach(() => {
    delete process.env.ENCRYPTION_KEY
    delete process.env.ENCRYPTION_KEY_PREVIOUS
  })

  it('treats a quoted key with a trailing newline as the bare key', () => {
    process.env.ENCRYPTION_KEY = '"secret"\n'
    const payload = encrypt('hello')
    process.env.ENCRYPTION_KEY = 'secret'
    expect(decrypt(payload)).toBe('hello')
  })

  it('still decrypts records written under the raw, unsanitized key', () => {
    const rawKey = '"secret"\n'
    const legacy = legacyEncrypt('hello', rawKey)
    process.env.ENCRYPTION_KEY = rawKey
    expect(decrypt(legacy)).toBe('hello')
  })

  it('falls back to ENCRYPTION_KEY_PREVIOUS and rejects unknown keys', () => {
    const old = legacyEncrypt('hello', 'old')
    process.env.ENCRYPTION_KEY = 'new'
    expect(() => decrypt(old)).toThrow()
    process.env.ENCRYPTION_KEY_PREVIOUS = 'old'
    expect(decrypt(old)).toBe('hello')
  })
})
