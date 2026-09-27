'use client'

import { useEffect, useState } from 'react'
import { useAuth, authFetch } from '@/lib/auth-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { CheckCircle2, AlertCircle, Copy, Send, Trash2, ExternalLink } from 'lucide-react'

function InstagramIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

export default function InstagramSettingsPage() {
  const { user, loading, getToken } = useAuth()
  const [channel, setChannel] = useState(null)
  const [form, setForm] = useState({ pageAccessToken: '', instagramAccountId: '' })
  const [testSend, setTestSend] = useState({ recipientId: '', message: 'Hi! This is a test message from DMForge.' })
  const [busy, setBusy] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)

  async function load() {
    try {
      const res = await authFetch('/api/channels', { method: 'GET' }, getToken)
      const data = await res.json()
      const ig = (data.channels || []).find((c) => c.id === 'instagram')
      setChannel(ig || null)
    } catch {
      toast.error('Failed to load Instagram channel status')
    }
  }

  useEffect(() => {
    if (user) load()
  }, [user])

  async function handleConnect(e) {
    e.preventDefault()
    if (!form.pageAccessToken.trim() || !form.instagramAccountId.trim()) {
      toast.error('Page access token and Instagram account ID are required')
      return
    }

    setBusy(true)
    try {
      const res = await authFetch(
        '/api/channels/instagram/connect',
        { method: 'POST', body: JSON.stringify(form) },
        getToken
      )
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Connected to Instagram account @${data.account.username || data.account.id}!`)
        setForm({ pageAccessToken: '', instagramAccountId: '' })
        load()
      } else {
        toast.error(data.error || 'Instagram verification failed')
      }
    } catch (err) {
      toast.error('Failed to connect to Instagram')
    } finally {
      setBusy(false)
    }
  }

  async function handleDisconnect() {
    setBusy(true)
    try {
      const res = await authFetch('/api/channels/instagram', { method: 'DELETE' }, getToken)
      if (res.ok) {
        toast.success('Instagram channel disconnected')
        setChannel(null)
      } else {
        toast.error('Failed to disconnect Instagram')
      }
    } catch {
      toast.error('Failed to disconnect Instagram')
    } finally {
      setBusy(false)
    }
  }

  async function handleSendTest(e) {
    e.preventDefault()
    if (!testSend.recipientId.trim() || !testSend.message.trim()) {
      toast.error('Recipient ID and message text are required')
      return
    }

    setSendingTest(true)
    try {
      const res = await authFetch(
        '/api/outreach/instagram/send',
        { method: 'POST', body: JSON.stringify(testSend) },
        getToken
      )
      const data = await res.json()
      if (res.ok && data.sent) {
        toast.success('Test Instagram DM dispatched successfully!')
      } else {
        toast.error(data.error || 'Failed to send test DM')
      }
    } catch {
      toast.error('Failed to send test Instagram message')
    } finally {
      setSendingTest(false)
    }
  }

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/meta`
    : 'https://www.dmforge.org/api/webhooks/meta'

  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  if (loading) return <div className="text-[#A0A0C8] py-8">Loading channel details...</div>
  if (!user) return <div className="text-[#A0A0C8] py-8">Sign in to manage channels.</div>

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#833AB4]/20 via-[#FD1D1D]/20 to-[#FCB045]/20 border border-[#FD1D1D]/30 p-6 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] flex items-center justify-center text-white shadow-lg">
            <InstagramIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
              Instagram Direct Messaging
              {channel?.connected && (
                <Badge className="bg-[#34D399]/20 text-[#34D399] border-[#34D399]/30 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Active
                </Badge>
              )}
            </h2>
            <p className="text-xs text-[#A0A0C8] mt-0.5">
              Direct connection to Meta Graph API for automated DM qualifying and booking conversations.
            </p>
          </div>
        </div>
      </div>

      {/* Connected State Card */}
      {channel?.connected ? (
        <Card className="bg-[#161630] border-[#2A2A55] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#2A2A55] pb-4">
            <div>
              <div className="text-xs font-semibold text-[#A0A0C8] uppercase tracking-wider">Connected Account</div>
              <div className="text-lg font-bold text-white mt-1">
                @{channel.username || channel.name || 'Instagram Account'}
              </div>
              <div className="text-xs text-[#A0A0C8] mt-0.5">
                Account ID: <span className="font-mono text-white/80">{channel.instagramAccountId}</span>
              </div>
            </div>
            <Button
              onClick={handleDisconnect}
              disabled={busy}
              variant="outline"
              className="bg-transparent border-[#2A2A55] hover:border-red-500/50 hover:bg-red-500/10 text-red-400 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Disconnect Instagram
            </Button>
          </div>

          {/* Test DM Box */}
          <div className="bg-[#0B0B1A] border border-[#2A2A55] p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
              <Send className="w-4 h-4 text-[#FF4D6D]" /> Test Live Outbound DM
            </h3>
            <p className="text-xs text-[#A0A0C8] mb-4">
              Send a test message to an Instagram Scoped User ID (IGSID) to verify token permissions.
            </p>
            <form onSubmit={handleSendTest} className="space-y-3">
              <div>
                <label className="text-xs text-[#A0A0C8] block mb-1">Recipient Instagram Scoped ID (IGSID)</label>
                <Input
                  value={testSend.recipientId}
                  onChange={(e) => setTestSend({ ...testSend, recipientId: e.target.value })}
                  placeholder="e.g. 17841400000000000"
                  className="bg-[#161630] border-[#2A2A55] text-sm font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-[#A0A0C8] block mb-1">Message Content</label>
                <Input
                  value={testSend.message}
                  onChange={(e) => setTestSend({ ...testSend, message: e.target.value })}
                  className="bg-[#161630] border-[#2A2A55] text-sm"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={sendingTest}
                className="btn-primary border-0 text-xs"
              >
                {sendingTest ? 'Sending...' : 'Dispatch Test DM'}
              </Button>
            </form>
          </div>
        </Card>
      ) : (
        /* Connect Form Card */
        <Card className="bg-[#161630] border-[#2A2A55] p-6">
          <h3 className="font-semibold text-white text-base mb-2">Connect Your Instagram Account</h3>
          <p className="text-xs text-[#A0A0C8] mb-6">
            Provide your Meta Page Access Token and Instagram Business Account ID. DMForge will test the credentials with Meta Graph API in real-time before saving.
          </p>
          <form onSubmit={handleConnect} className="space-y-4 max-w-xl">
            <div>
              <label className="text-xs font-medium text-[#A0A0C8] block mb-1.5">
                Meta Page Access Token <span className="text-[#FF4D6D]">*</span>
              </label>
              <Input
                type="password"
                value={form.pageAccessToken}
                onChange={(e) => setForm({ ...form, pageAccessToken: e.target.value })}
                placeholder="EAA..."
                className="bg-[#0B0B1A] border-[#2A2A55] text-sm font-mono"
                required
              />
              <span className="text-[11px] text-[#A0A0C8] mt-1 block">
                Never shared publicly. Encrypted at rest via AES-256-GCM.
              </span>
            </div>

            <div>
              <label className="text-xs font-medium text-[#A0A0C8] block mb-1.5">
                Instagram Business Account ID <span className="text-[#FF4D6D]">*</span>
              </label>
              <Input
                type="text"
                value={form.instagramAccountId}
                onChange={(e) => setForm({ ...form, instagramAccountId: e.target.value })}
                placeholder="e.g. 17841400000000000"
                className="bg-[#0B0B1A] border-[#2A2A55] text-sm font-mono"
                required
              />
              <span className="text-[11px] text-[#A0A0C8] mt-1 block">
                Found in Meta Business Suite or via Graph Explorer (`GET /me/accounts`).
              </span>
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="btn-primary border-0 text-sm font-medium mt-2"
            >
              {busy ? 'Verifying with Meta...' : 'Verify & Connect Instagram'}
            </Button>
          </form>
        </Card>
      )}

      {/* Meta Webhook Ingestion Configuration Guide */}
      <Card className="bg-[#161630] border-[#2A2A55] p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <AlertCircle className="w-4 h-4 text-[#6B5BFF]" /> Inbound Webhook Configuration (Meta Developer Portal)
        </div>
        <p className="text-xs text-[#A0A0C8] leading-relaxed">
          To receive incoming DMs from leads and allow your AI appointment setter to qualify and book calls automatically, configure this webhook in your Meta App:
        </p>

        <div className="space-y-3 bg-[#0B0B1A] border border-[#2A2A55] p-4 rounded-lg">
          <div>
            <div className="text-[11px] text-[#A0A0C8] uppercase font-semibold">Callback URL</div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <code className="text-xs text-white font-mono bg-[#161630] px-2.5 py-1.5 rounded border border-[#2A2A55] flex-1 overflow-x-auto">
                {webhookUrl}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(webhookUrl, 'Callback URL')}
                className="bg-transparent border-[#2A2A55] text-xs h-8"
              >
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy
              </Button>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-[#A0A0C8] uppercase font-semibold">Verify Token</div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <code className="text-xs text-white font-mono bg-[#161630] px-2.5 py-1.5 rounded border border-[#2A2A55] flex-1">
                dmforge_meta_verify
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard('dmforge_meta_verify', 'Verify Token')}
                className="bg-transparent border-[#2A2A55] text-xs h-8"
              >
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy
              </Button>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-[#A0A0C8] uppercase font-semibold">Subscribed Fields</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-[#1F1F42] border-[#2A2A55] text-xs font-mono text-[#34D399]">messages</Badge>
              <Badge className="bg-[#1F1F42] border-[#2A2A55] text-xs font-mono text-[#34D399]">messaging_postbacks</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
