const { test, expect } = require('@playwright/test')

test('instagram and messenger endpoints require auth', async ({ request }) => {
  const igConnect = await request.post('/api/channels/instagram/connect', {
    data: { pageAccessToken: 'fake-token', instagramAccountId: '17841400000000' }
  })
  expect(igConnect.status()).toBe(401)

  const msgConnect = await request.post('/api/channels/messenger/connect', {
    data: { pageAccessToken: 'fake-token', pageId: '1000000000000' }
  })
  expect(msgConnect.status()).toBe(401)

  const igSend = await request.post('/api/outreach/instagram/send', {
    data: { recipientId: 'ig-user-123', message: 'Hello' }
  })
  expect(igSend.status()).toBe(401)

  const msgSend = await request.post('/api/outreach/messenger/send', {
    data: { recipientId: 'msg-user-123', message: 'Hello' }
  })
  expect(msgSend.status()).toBe(401)
})

test('meta webhook challenge rejects invalid verify token with 403', async ({ request }) => {
  const res = await request.get('/api/webhooks/meta?hub.mode=subscribe&hub.challenge=test_challenge_123&hub.verify_token=invalid_token')
  expect(res.status()).toBe(403)
})
