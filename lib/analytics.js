'use client'
import posthog from 'posthog-js'

const CONSENT_KEY = 'dmforge_analytics_consent'

export function getConsent() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(CONSENT_KEY)
  } catch {
    return null
  }
}

export function setConsent(granted) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied')
  } catch {}
  if (granted) initAnalytics()
}

let initialized = false

function isEnabled() {
  return typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_POSTHOG_KEY
}

export function initAnalytics() {
  if (!isEnabled() || initialized) return
  initialized = true
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    capture_pageview: false,
    person_profiles: 'identified_only',
  })
}

export function track(event, properties) {
  if (!isEnabled() || !initialized) return
  posthog.capture(event, properties)
}

export function identify(userId, properties) {
  if (!isEnabled() || !initialized) return
  posthog.identify(userId, properties)
}
