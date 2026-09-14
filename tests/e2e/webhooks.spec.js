const { test, expect } = require('@playwright/test')

// ponytail: no auth token plumbing in this suite, so we only assert the
// auth boundary — full CRUD + HMAC delivery needs a signed-in user/token.
test('webhook endpoints require auth', async ({ request }) => {
  const post = await request.post('/api/webhooks', { data: { url: 'https://example.com/hook', events: ['appointment.booked'] } })
  expect(post.status()).toBe(401)

  const get = await request.get('/api/webhooks')
  expect(get.status()).toBe(401)

  const del = await request.delete('/api/webhooks/some-id')
  expect(del.status()).toBe(401)
})

test('webhook registration rejects invalid input', async ({ request }) => {
  const res = await request.post('/api/webhooks', { data: { url: 'not-a-url', events: ['appointment.booked'] } })
  expect([400, 401]).toContain(res.status())
})

// proxy.js redirects every signed-out /settings/* request home before the page
// renders, so the page's own "sign in" fallback is never reached from here.
test('/settings/webhooks redirects home when logged out', async ({ request }) => {
  const res = await request.get('/settings/webhooks', { maxRedirects: 0 })
  expect(res.status()).toBe(307)
  expect(new URL(res.headers().location, 'http://x').pathname).toBe('/')
})
