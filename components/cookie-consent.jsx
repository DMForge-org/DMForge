'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getConsent, setConsent } from '@/lib/analytics'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(getConsent() === null)
  }, [])

  if (!visible) return null

  function choose(granted) {
    setConsent(granted)
    setVisible(false)
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-[#0B0B1A]/95 backdrop-blur px-6 py-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-4 text-sm text-white/70">
        <p className="flex-1">
          We use cookies for product analytics to improve DMForge. See our{' '}
          <a href="/legal/privacy" className="underline hover:text-white">Privacy Policy</a>.
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => choose(false)}>Decline</Button>
          <Button size="sm" onClick={() => choose(true)}>Accept</Button>
        </div>
      </div>
    </div>
  )
}
