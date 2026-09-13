const { test, expect } = require('@playwright/test')

test('channel and outreach endpoints require auth', async ({ request }) => {
  const connect = await request.post('/api/channels/email/connect', { data: { provider: 'smtp', host: 'x', port: 587, user: 'a', pass: 'b' } })
  expect(connect.status()).toBe(401)

  const list = await request.get('/api/channels')
  expect(list.status()).toBe(401)

  const send = await request.post('/api/outreach/send', { data: { to: 'a@b.com', subject: 'hi', body: 'hi' } })
  expect(send.status()).toBe(401)
})

// proxy.js (added 2026-07-09) redirects every signed-out /settings/* request
// home before the page renders; this used to assert the page's own sign-in
// fallback, which that redirect made unreachable.
test('/settings/channels redirects home when logged out', async ({ request }) => {
  const res = await request.get('/settings/channels', { maxRedirects: 0 })
  expect(res.status()).toBe(307)
  expect(new URL(res.headers().location, 'http://x').pathname).toBe('/')
})
