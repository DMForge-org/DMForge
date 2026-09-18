'use client'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/auth-context'
import { ErrorBoundary } from '@/components/error-boundary'
import { AnalyticsProvider } from '@/components/analytics-provider'
import { CookieConsent } from '@/components/cookie-consent'

export function Providers({ children }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AnalyticsProvider />
        {children}
        <Toaster theme="dark" position="top-right" richColors />
        <CookieConsent />
      </AuthProvider>
    </ErrorBoundary>
  )
}
