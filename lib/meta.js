// Meta Graph API (v21.0) client for Instagram DM and Facebook Messenger.
// Directly interacts with Meta Graph API for zero false-states verification and messaging.

const GRAPH_API_BASE = 'https://graph.facebook.com/v21.0'

/**
 * Verifies a Facebook Page access token and retrieves Page details.
 *
 * @param {object} params
 * @param {string} params.pageAccessToken
 * @param {string} params.pageId
 * @returns {Promise<{ id: string, name: string }>}
 */
export async function verifyMetaPageToken({ pageAccessToken, pageId }) {
  if (!pageAccessToken || !pageId) {
    throw new Error('pageAccessToken and pageId are required')
  }

  const cleanToken = pageAccessToken.trim()
  const cleanPageId = pageId.trim()

  const url = `${GRAPH_API_BASE}/${cleanPageId}?fields=id,name&access_token=${encodeURIComponent(cleanToken)}`
  const res = await fetch(url)
  const data = await res.json().catch(() => ({}))

  if (!res.ok || data.error) {
    const msg = data.error?.message || `Meta Page verification failed with HTTP ${res.status}`
    throw new Error(msg)
  }

  return {
    id: data.id,
    name: data.name,
  }
}

/**
 * Verifies an Instagram Professional account via Page access token.
 *
 * @param {object} params
 * @param {string} params.pageAccessToken
 * @param {string} params.instagramAccountId
 * @returns {Promise<{ id: string, username: string, name: string }>}
 */
export async function verifyMetaInstagramToken({ pageAccessToken, instagramAccountId }) {
  if (!pageAccessToken || !instagramAccountId) {
    throw new Error('pageAccessToken and instagramAccountId are required')
  }

  const cleanToken = pageAccessToken.trim()
  const cleanAccountId = instagramAccountId.trim()

  const url = `${GRAPH_API_BASE}/${cleanAccountId}?fields=id,username,name,profile_picture_url&access_token=${encodeURIComponent(cleanToken)}`
  const res = await fetch(url)
  const data = await res.json().catch(() => ({}))

  if (!res.ok || data.error) {
    const msg = data.error?.message || `Instagram account verification failed with HTTP ${res.status}`
    throw new Error(msg)
  }

  return {
    id: data.id,
    username: data.username || data.name || cleanAccountId,
    name: data.name || data.username || '',
  }
}

/**
 * Sends an outbound message via Instagram DM or Facebook Messenger.
 *
 * @param {object} params
 * @param {string} params.pageAccessToken
 * @param {string} params.recipientId
 * @param {string} params.message
 * @param {'instagram'|'messenger'} [params.channel='messenger']
 * @param {string} [params.instagramAccountId]
 * @returns {Promise<{ success: boolean, messageId: string }>}
 */
export async function sendMetaMessage({
  pageAccessToken,
  recipientId,
  message,
  channel = 'messenger',
  instagramAccountId,
}) {
  if (!pageAccessToken) throw new Error('pageAccessToken is required')
  if (!recipientId) throw new Error('recipientId is required')
  if (!message) throw new Error('message text is required')

  const cleanToken = pageAccessToken.trim()
  const endpoint =
    channel === 'instagram' && instagramAccountId
      ? `${GRAPH_API_BASE}/${instagramAccountId.trim()}/messages`
      : `${GRAPH_API_BASE}/me/messages`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipient: { id: recipientId.trim() },
      message: { text: message },
    }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok || data.error) {
    const msg = data.error?.message || `Meta message send failed with HTTP ${res.status}`
    throw new Error(msg)
  }

  return {
    success: true,
    messageId: data.message_id || data.recipient_id || 'sent',
  }
}
