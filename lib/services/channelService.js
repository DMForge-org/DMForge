import crypto from 'crypto'
import { encrypt, decrypt } from '@/lib/encryption'
import { testConnection as testEmailConnection, sendEmail } from '@/lib/email'
import {
  authorizeUrl as linkedinAuthorizeUrl,
  exchangeCode as linkedinExchangeCode,
  fetchProfile as linkedinFetchProfile,
  sendMessage as linkedinSendMessage,
} from '@/lib/linkedin'
import { logError } from '@/lib/logger'
import { getBaseUrl } from '@/lib/baseUrl'
import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  BadGatewayError,
} from '@/lib/errors'
import {
  emailConnectSchema,
  emailOutreachSchema,
  linkedinSendSchema,
  validate,
} from '@/lib/schemas'

function truncate(str, max) {
  if (typeof str !== 'string') return str
  return str.slice(0, max)
}

function defaultSer(doc) {
  if (!doc) return null
  const data = doc.data ? doc.data() : doc
  const out = {}
  for (const [k, v] of Object.entries(data)) {
    if (v && typeof v.toDate === 'function') out[k] = v.toDate().toISOString()
    else out[k] = v
  }
  return out
}

/**
 * Connects and verifies an email channel (Gmail or custom SMTP) for a user.
 */
export async function connectEmailChannel({
  db,
  FieldValue,
  user,
  body,
  testEmailConnectionFn = testEmailConnection,
  encryptFn = encrypt,
}) {
  if (!user?.uid) throw new UnauthorizedError('unauthorized')
  const { provider, host, port, user: emailUser, pass } = validate(emailConnectSchema, body)

  const result = await testEmailConnectionFn({
    provider,
    host,
    port,
    user: emailUser,
    pass,
  })

  if (!result.success) {
    throw new ValidationError(result.error || 'Failed to connect email channel')
  }

  const encryptedCreds = encryptFn(JSON.stringify(result.creds))
  await db
    .collection('users')
    .doc(user.uid)
    .collection('channels')
    .doc('email')
    .set({
      provider,
      connected: true,
      email: truncate(emailUser, 200),
      encryptedCreds,
      updatedAt: FieldValue.serverTimestamp(),
    })

  return { success: true }
}

/**
 * Disconnects the email channel for a user.
 */
export async function disconnectEmailChannel({ db, user }) {
  if (!user?.uid) throw new UnauthorizedError('unauthorized')
  await db
    .collection('users')
    .doc(user.uid)
    .collection('channels')
    .doc('email')
    .delete()
  return { ok: true }
}

/**
 * Lists connected channels for a user, stripping secrets.
 */
export async function listChannels({ db, user, ser = defaultSer }) {
  if (!user?.uid) throw new UnauthorizedError('unauthorized')
  const qs = await db
    .collection('users')
    .doc(user.uid)
    .collection('channels')
    .get()

  const channels = qs.docs.map((d) => {
    const c = ser(d)
    delete c.encryptedCreds
    return { id: d.id, ...c }
  })

  return { channels }
}

/**
 * Sends outbound cold email with unsubscribe footer and suppression/deduplication checks.
 */
export async function sendEmailOutreach({
  db,
  FieldValue,
  user,
  body,
  decryptFn = decrypt,
  sendEmailFn = sendEmail,
}) {
  if (!user?.uid) throw new UnauthorizedError('unauthorized')
  const { to, subject, body: text } = validate(emailOutreachSchema, body)

  const channelSnap = await db
    .collection('users')
    .doc(user.uid)
    .collection('channels')
    .doc('email')
    .get()

  if (!channelSnap.exists || !channelSnap.data().connected) {
    throw new ValidationError('email channel not connected')
  }

  const creds = JSON.parse(decryptFn(channelSnap.data().encryptedCreds))

  // Unsubscribe suppression check
  const suppressKey = crypto
    .createHash('sha256')
    .update(to.trim().toLowerCase())
    .digest('hex')
  const suppressed = await db
    .collection('users')
    .doc(user.uid)
    .collection('suppressed')
    .doc(suppressKey)
    .get()

  if (suppressed.exists) {
    return { sent: false, skipped: 'suppressed' }
  }

  // Deduplication check
  const hash = crypto
    .createHash('sha256')
    .update(`${to}|${subject}|${text}`)
    .digest('hex')
  const sentRef = db
    .collection('users')
    .doc(user.uid)
    .collection('sentMessages')

  const dupe = await sentRef.where('hash', '==', hash).limit(1).get()
  if (!dupe.empty) {
    return { sent: false, skipped: 'duplicate' }
  }

  // Unsubscribe token construction
  const hmac = crypto
    .createHmac('sha256', process.env.ENCRYPTION_KEY || 'default-outreach-secret')
    .update(`${user.uid}|${to.trim().toLowerCase()}`)
    .digest('hex')
  const token = `${Buffer.from(to.trim().toLowerCase()).toString('base64url')}.${hmac}`
  const unsubUrl = `${getBaseUrl()}/api/outreach/unsubscribe?uid=${user.uid}&token=${token}`

  const footer = `\n\n---\nTo unsubscribe: ${unsubUrl}`
  const bodyWithFooter = `${text}${footer}`

  const result = await sendEmailFn(creds, {
    to,
    subject,
    body: bodyWithFooter,
    html: `<p>${text.replace(/\n/g, '<br>')}</p><hr style="border:none;border-top:1px solid #ccc;margin:20px 0;"><p style="font-size:12px;color:#888;">To stop receiving these emails, <a href="${unsubUrl}">unsubscribe here</a>.</p>`,
  })

  await sentRef.add({
    to,
    subject: truncate(subject, 200),
    hash,
    channel: 'email',
    sentAt: FieldValue.serverTimestamp(),
    status: result.success ? 'sent' : 'failed',
    messageId: result.messageId || null,
  })

  return { sent: true, messageId: result.messageId }
}

/**
 * Handles email outreach unsubscription.
 */
export async function handleEmailUnsubscribe({ db, FieldValue, uid, token }) {
  if (!uid || !token) throw new ValidationError('uid and token required')

  const [toBase64, hmac] = token.split('.')
  if (!toBase64 || !hmac) throw new ValidationError('invalid token')

  let to
  try {
    to = Buffer.from(toBase64, 'base64url').toString('utf8')
  } catch {
    throw new ValidationError('invalid token encoding')
  }

  const expectedHmac = crypto
    .createHmac('sha256', process.env.ENCRYPTION_KEY || 'default-outreach-secret')
    .update(`${uid}|${to}`)
    .digest('hex')

  const hmacBuf = Buffer.from(hmac)
  const expBuf = Buffer.from(expectedHmac)
  if (hmacBuf.length !== expBuf.length || !crypto.timingSafeEqual(hmacBuf, expBuf)) {
    throw new ForbiddenError('invalid token signature')
  }

  const key = crypto.createHash('sha256').update(to).digest('hex')
  await db
    .collection('users')
    .doc(uid)
    .collection('suppressed')
    .doc(key)
    .set({
      email: to,
      unsubscribedAt: FieldValue.serverTimestamp(),
    })

  return { email: to }
}

/**
 * Generates the LinkedIn OAuth consent URL.
 */
export function getLinkedInAuthUrl({
  user,
  baseUrl = getBaseUrl(),
  linkedinAuthorizeUrlFn = linkedinAuthorizeUrl,
  encryptFn = encrypt,
}) {
  if (!user?.uid) throw new UnauthorizedError('unauthorized')
  const redirectUri =
    process.env.LINKEDIN_REDIRECT_URI ||
    `${baseUrl}/api/auth/linkedin/callback`
  const state = encryptFn(
    JSON.stringify({ uid: user.uid, ts: Date.now() })
  )
  const url = linkedinAuthorizeUrlFn(state, redirectUri)
  return { url }
}

/**
 * Handles LinkedIn OAuth callback, exchanging code for tokens and storing them.
 */
export async function handleLinkedInCallback({
  db,
  FieldValue,
  code,
  state,
  baseUrl = getBaseUrl(),
  linkedinExchangeCodeFn = linkedinExchangeCode,
  linkedinFetchProfileFn = linkedinFetchProfile,
  decryptFn = decrypt,
  encryptFn = encrypt,
}) {
  if (!code || !state) throw new ValidationError('missing_code_or_state')

  let payload
  try {
    payload = JSON.parse(decryptFn(state))
  } catch {
    throw new ValidationError('invalid_state')
  }

  const { uid, ts } = payload
  if (!uid || Date.now() - ts > 10 * 60_000) {
    throw new ValidationError('state_expired')
  }

  const redirectUri =
    process.env.LINKEDIN_REDIRECT_URI ||
    `${baseUrl}/api/auth/linkedin/callback`

  const tokens = await linkedinExchangeCodeFn(code, redirectUri)
  const profile = await linkedinFetchProfileFn(tokens.access_token)

  await db
    .collection('users')
    .doc(uid)
    .collection('channels')
    .doc('linkedin')
    .set({
      provider: 'linkedin',
      connected: true,
      email: profile.email || null,
      name: profile.name || null,
      authorUrn: profile.id ? `urn:li:person:${profile.id}` : null,
      encryptedCreds: encryptFn(
        JSON.stringify({
          access_token: tokens.access_token,
          expires_at: Date.now() + (tokens.expires_in || 5184000) * 1000,
          authorUrn: profile.id ? `urn:li:person:${profile.id}` : null,
        })
      ),
      updatedAt: FieldValue.serverTimestamp(),
    })

  return { uid, profile }
}

/**
 * Sends a message via connected LinkedIn account.
 */
export async function sendLinkedInOutreach({
  db,
  user,
  body,
  decryptFn = decrypt,
  linkedinSendMessageFn = linkedinSendMessage,
}) {
  if (!user?.uid) throw new UnauthorizedError('unauthorized')
  const { recipientUrn, message } = validate(linkedinSendSchema, body)

  const snap = await db
    .collection('users')
    .doc(user.uid)
    .collection('channels')
    .doc('linkedin')
    .get()

  if (!snap.exists || !snap.data().connected) {
    throw new ValidationError('linkedin channel not connected')
  }

  const creds = JSON.parse(decryptFn(snap.data().encryptedCreds))
  try {
    const result = await linkedinSendMessageFn(
      creds.access_token,
      creds.authorUrn,
      recipientUrn,
      truncate(message, 2000)
    )
    return { sent: true, result }
  } catch (e) {
    logError('LinkedIn message send failed', e, { recipientUrn })
    throw new BadGatewayError('Failed to send LinkedIn message')
  }
}

/**
 * Disconnects LinkedIn channel for user.
 */
export async function disconnectLinkedInChannel({ db, user }) {
  if (!user?.uid) throw new UnauthorizedError('unauthorized')
  await db
    .collection('users')
    .doc(user.uid)
    .collection('channels')
    .doc('linkedin')
    .delete()
  return { ok: true }
}

