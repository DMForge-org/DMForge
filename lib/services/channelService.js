import crypto from 'crypto'
import { encrypt, decrypt } from '@/lib/encryption'
import { testConnection as testEmailConnection, sendEmail } from '@/lib/email'
import {
  verifyMetaPageToken,
  verifyMetaInstagramToken,
  sendMetaMessage,
} from '@/lib/meta'
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
  instagramConnectSchema,
  messengerConnectSchema,
  metaSendSchema,
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
 * Connects and verifies an Instagram channel for a user.
 */
export async function connectInstagramChannel({
  db,
  FieldValue,
  user,
  body,
  verifyInstagramFn = verifyMetaInstagramToken,
  encryptFn = encrypt,
}) {
  if (!user?.uid) throw new UnauthorizedError('unauthorized')
  const { pageAccessToken, instagramAccountId } = validate(instagramConnectSchema, body)

  let ig
  try {
    ig = await verifyInstagramFn({ pageAccessToken, instagramAccountId })
  } catch (err) {
    throw new ValidationError(err.message || 'Instagram verification failed')
  }

  const encryptedCreds = encryptFn(
    JSON.stringify({ pageAccessToken, instagramAccountId: ig.id })
  )

  await db
    .collection('users')
    .doc(user.uid)
    .collection('channels')
    .doc('instagram')
    .set({
      provider: 'instagram',
      connected: true,
      instagramAccountId: ig.id,
      username: ig.username,
      name: ig.name,
      encryptedCreds,
      updatedAt: FieldValue.serverTimestamp(),
    })

  // Global lookup mapping so inbound webhooks find the user without collectionGroup queries
  await db.collection('meta_channel_index').doc(ig.id).set({
    uid: user.uid,
    channel: 'instagram',
    updatedAt: FieldValue.serverTimestamp(),
  })

  return { success: true, account: { id: ig.id, username: ig.username, name: ig.name } }
}

/**
 * Disconnects the Instagram channel for a user.
 */
export async function disconnectInstagramChannel({ db, user }) {
  if (!user?.uid) throw new UnauthorizedError('unauthorized')
  const snap = await db.collection('users').doc(user.uid).collection('channels').doc('instagram').get()
  if (snap.exists && snap.data()?.instagramAccountId) {
    await db.collection('meta_channel_index').doc(snap.data().instagramAccountId).delete().catch(() => {})
  }
  await db
    .collection('users')
    .doc(user.uid)
    .collection('channels')
    .doc('instagram')
    .delete()
  return { ok: true }
}

/**
 * Connects and verifies a Facebook Messenger channel for a user.
 */
export async function connectMessengerChannel({
  db,
  FieldValue,
  user,
  body,
  verifyPageFn = verifyMetaPageToken,
  encryptFn = encrypt,
}) {
  if (!user?.uid) throw new UnauthorizedError('unauthorized')
  const { pageAccessToken, pageId } = validate(messengerConnectSchema, body)

  let page
  try {
    page = await verifyPageFn({ pageAccessToken, pageId })
  } catch (err) {
    throw new ValidationError(err.message || 'Messenger Page verification failed')
  }

  const encryptedCreds = encryptFn(
    JSON.stringify({ pageAccessToken, pageId: page.id })
  )

  await db
    .collection('users')
    .doc(user.uid)
    .collection('channels')
    .doc('messenger')
    .set({
      provider: 'messenger',
      connected: true,
      pageId: page.id,
      name: page.name,
      encryptedCreds,
      updatedAt: FieldValue.serverTimestamp(),
    })

  await db.collection('meta_channel_index').doc(page.id).set({
    uid: user.uid,
    channel: 'messenger',
    updatedAt: FieldValue.serverTimestamp(),
  })

  return { success: true, page: { id: page.id, name: page.name } }
}

/**
 * Disconnects the Facebook Messenger channel for a user.
 */
export async function disconnectMessengerChannel({ db, user }) {
  if (!user?.uid) throw new UnauthorizedError('unauthorized')
  const snap = await db.collection('users').doc(user.uid).collection('channels').doc('messenger').get()
  if (snap.exists && snap.data()?.pageId) {
    await db.collection('meta_channel_index').doc(snap.data().pageId).delete().catch(() => {})
  }
  await db
    .collection('users')
    .doc(user.uid)
    .collection('channels')
    .doc('messenger')
    .delete()
  return { ok: true }
}

/**
 * Sends an outbound message via connected Instagram or Messenger channel.
 */
export async function sendMetaOutreach({
  db,
  user,
  channel = 'messenger',
  body,
  decryptFn = decrypt,
  sendMetaMessageFn = sendMetaMessage,
}) {
  if (!user?.uid) throw new UnauthorizedError('unauthorized')
  const { recipientId, message } = validate(metaSendSchema, body)

  const snap = await db
    .collection('users')
    .doc(user.uid)
    .collection('channels')
    .doc(channel)
    .get()

  if (!snap.exists || !snap.data().connected) {
    throw new ValidationError(`${channel} channel not connected`)
  }

  const creds = JSON.parse(decryptFn(snap.data().encryptedCreds))
  try {
    const result = await sendMetaMessageFn({
      pageAccessToken: creds.pageAccessToken,
      recipientId,
      message: truncate(message, 2000),
      channel,
      instagramAccountId: creds.instagramAccountId,
    })
    return { sent: true, result }
  } catch (e) {
    logError(`Meta ${channel} message send failed`, e, { recipientId })
    throw new BadGatewayError(`Failed to send ${channel} message: ${e.message}`)
  }
}

