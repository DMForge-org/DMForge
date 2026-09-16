import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebaseAdmin'
import { getStripe } from '@/lib/stripe'
import { GEMINI_BASE, MODEL as GEMINI_MODEL } from '@/lib/llm'
import { checkRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

const TIMEOUT_MS = 5000

async function checkFirestore() {
  const start = Date.now()
  // Cheap connectivity/auth probe — a limit(1) read on an empty or missing
  // collection still succeeds, so this needs no seed data and does no writes.
  await getAdminDb().collection('_health').limit(1).get()
  return { ok: true, latencyMs: Date.now() - start }
}

async function checkStripe() {
  const start = Date.now()
  await getStripe().balance.retrieve()
  return { ok: true, latencyMs: Date.now() - start }
}

async function checkGemini() {
  const start = Date.now()
  if (!process.env.GEMINI_BASE_URL && !process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set')
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    // models.get metadata lookup — same base-URL/auth-header construction as
    // the real chat path, but a read with no generation billed against it.
    const res = await fetch(`${GEMINI_BASE()}/v1beta/models/${GEMINI_MODEL}`, {
      headers: process.env.GEMINI_API_KEY ? { 'x-goog-api-key': process.env.GEMINI_API_KEY } : {},
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  } finally {
    clearTimeout(timeout)
  }
  return { ok: true, latencyMs: Date.now() - start }
}

// Unauthenticated by design (uptime monitors hit this) — reuses the same
// anonymous per-IP limiter as every other public route so it can't be used
// to hammer Stripe/Gemini/Firestore for free.
export async function GET(request) {
  if (!(await checkRateLimit(request, null))) {
    return NextResponse.json({ error: 'rate_limit_exceeded' }, { status: 429 })
  }

  const [firestore, stripe, gemini] = await Promise.all([
    checkFirestore().catch((err) => ({ ok: false, error: err.message })),
    checkStripe().catch((err) => ({ ok: false, error: err.message })),
    checkGemini().catch((err) => ({ ok: false, error: err.message })),
  ])
  const ok = firestore.ok && stripe.ok && gemini.ok

  return NextResponse.json(
    { ok, checks: { firestore, stripe, gemini }, timestamp: new Date().toISOString() },
    { status: ok ? 200 : 503 }
  )
}
