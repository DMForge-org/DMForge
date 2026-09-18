'use client'
import { useEffect } from 'react'
import { getConsent, initAnalytics } from '@/lib/analytics'

export function AnalyticsProvider() {
  useEffect(() => {
    if (getConsent() === 'granted') initAnalytics()
  }, [])
  return null
}
