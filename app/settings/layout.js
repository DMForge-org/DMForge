'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowLeft,
  Radio,
  Plug,
  Users,
  Webhook,
  Palette,
  MessageCircle,
} from 'lucide-react'

const TABS = [
  { href: '/settings/channels', label: 'Channels Hub', icon: Radio },
  { href: '/settings/channels/instagram', label: 'Instagram DM', icon: MessageCircle },
  { href: '/settings/channels/messenger', label: 'Messenger', icon: MessageCircle },
  { href: '/settings/integrations', label: 'Integrations', icon: Plug },
  { href: '/settings/team', label: 'Team', icon: Users },
  { href: '/settings/webhooks', label: 'Webhooks', icon: Webhook },
  { href: '/settings/white-label', label: 'White-Label', icon: Palette },
]

export default function SettingsLayout({ children }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-5 py-10">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[#A0A0C8] hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-[#A0A0C8] mt-1">
              Configure your outreach channels, Meta connections, webhook triggers, and workspace setup.
            </p>
          </div>
        </div>
      </div>

      {/* Multi-page Settings Navigation Bar */}
      <nav
        aria-label="Settings navigation"
        className="flex items-center gap-1 border-b border-[#2A2A55] pb-px mb-8 overflow-x-auto scrollbar-none"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs md:text-sm font-medium rounded-t-lg transition-all whitespace-nowrap border-b-2 -mb-px ${
                isActive
                  ? 'border-[#FF4D6D] text-white bg-[#1F1F42]/80 font-semibold shadow-sm'
                  : 'border-transparent text-[#A0A0C8] hover:text-white hover:bg-[#161630]/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF4D6D]' : 'text-[#A0A0C8]'}`} />
              {tab.label}
            </Link>
          )
        })}
      </nav>

      {/* Active Tab Page Content */}
      <main>{children}</main>
    </div>
  )
}
