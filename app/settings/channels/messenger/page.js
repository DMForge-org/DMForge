'use client'

import { useEffect, useState } from 'react'
import { useAuth, authFetch } from '@/lib/auth-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { CheckCircle2, AlertCircle, Copy, Send, Trash2, MessageCircle } from 'lucide-react'

export default function MessengerSettingsPage() {
  const { user, loading, getToken } = useAuth()
  const [channel, setChannel] = useState(null)
  const [form, setForm] = useState({ pageAccessToken: '', pageId: '' })
  const [testSend, setTestSend] = useState({ recipientId: '', message: 'Hi! This is a test message from DMForge via Facebook Messenger.' })
  const [busy, setBusy] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)

  async function load() {
    try {
      const res = await authFetch('/api/channels', { method: 'GET' }, getToken)
      const data = await res.json()
      const fb = (data.channels || []).find((c) => c.id === 'messenger')
      setChannel(fb || null)
    } catch {
      toast.error('Failed to load Messenger channel status')
    }
  }

  useEffect(() => {
    if (user) load()
  }, [user])

  async function handleConnect(e) {
    e.preventDefault()
    if (!form.pageAccessToken.trim() || !form.pageId.trim()) {
      toast.error('Page access token and Page ID are required')
      return
    }

    setBusy(true)
    try {
      const res = await authFetch(
        '/api/channels/messenger/connect',
        { method: 'POST', body: JSON.stringify(form) },
        getToken
      )
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Connected to Facebook Page: ${data.page.name || data.page.id}!`)
        setForm({ pageAccessToken: '', pageId: '' })
        load()
      } else {
        toast.error(data.error || 'Messenger verification failed')
      }
    } catch (err) {
      toast.error('Failed to connect to Messenger')
    } finally {
      setBusy(false)
    }
  }

  async function handleDisconnect() {
    setBusy(true)
    try {
      const res = await authFetch('/api/channels/messenger', { method: 'DELETE' }, getToken)
      if (res.ok) {
        toast.success('Messenger channel disconnected')
        setChannel(null)
      } else {
        toast.error('Failed to disconnect Messenger')
      }
    } catch {
      toast.error('Failed to disconnect Messenger')
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
        '/api/outreach/messenger/send',
        { method: 'POST', body: JSON.stringify(testSend) },
        getToken
      )
      const data = await res.json()
      if (res.ok && data.sent) {
        toast.success('Test Messenger message dispatched successfully!')
      } else {
        toast.error(data.error || 'Failed to send test message')
      }
    } catch {
      toast.error('Failed to send test Messenger message')
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
      <div className="flex items-center justify-between bg-gradient-to-r from-[#0084FF]/20 via-[#00C6FF]/20 to-[#6B5BFF]/20 border border-[#0084FF]/30 p-6 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0084FF] to-[#00C6FF] flex items-center justify-center text-white shadow-lg">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
              Facebook Messenger
              {channel?.connected && (
                <Badge className="bg-[#34D399]/20 text-[#34D399] border-[#34D399]/30 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Active
                </Badge>
              )}
            </h2>
            <p className="text-xs text-[#A0A0C8] mt-0.5">
              Direct connection to Meta Graph API for automated Page Messenger appointment booking conversations.
            </p>
          </div>
        </div>
      </div>

      {/* Connected State Card */}
      {channel?.connected ? (
        <Card className="bg-[#161630] border-[#2A2A55] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#2A2A55] pb-4">
            <div>
              <div className="text-xs font-semibold text-[#A0A0C8] uppercase tracking-wider">Connected Facebook Page</div>
              <div className="text-lg font-bold text-white mt-1">
                {channel.name || 'Facebook Page'}
              </div>
              <div className="text-xs text-[#A0A0C8] mt-0.5">
                Page ID: <span className="font-mono text-white/80">{channel.pageId}</span>
              </div>
            </div>
            <Button
              onClick={handleDisconnect}
              disabled={busy}
              variant="outline"
              className="bg-transparent border-[#2A2A55] hover:border-red-500/50 hover:bg-red-500/10 text-red-400 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Disconnect Messenger
            </Button>
          </div>

          {/* Test DM Box */}
          <div className="bg-[#0B0B1A] border border-[#2A2A55] p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
              <Send className="w-4 h-4 text-[#0084FF]" /> Test Live Outbound Message
            </h3>
            <p className="text-xs text-[#A0A0C8] mb-4">
              Send a test message to a Facebook Page-Scoped User ID (PSID) to verify delivery.
            </p>
            <form onSubmit={handleSendTest} className="space-y-3">
              <div>
                <label className="text-xs text-[#A0A0C8] block mb-1">Recipient Page-Scoped ID (PSID)</label>
                <Input
                  value={testSend.recipientId}
                  onChange={(e) => setTestSend({ ...testSend, recipientId: e.target.value })}
                  placeholder="e.g. 100000000000000"
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
                className="bg-[#0084FF] hover:bg-[#0070db] text-white border-0 text-xs font-semibold"
              >
                {sendingTest ? 'Sending...' : 'Dispatch Test Message'}
              </Button>
            </form>
          </div>
        </Card>
      ) : (
        /* Connect Form Card */
        <Card className="bg-[#161630] border-[#2A2A55] p-6">
          <h3 className="font-semibold text-white text-base mb-2">Connect Your Facebook Page</h3>
          <p className="text-xs text-[#A0A0C8] mb-6">
            Provide your Meta Page Access Token and Page ID. DMForge will test the credentials with Meta Graph API in real-time before saving.
          </p>
          <form onSubmit={handleConnect} className="space-y-4 max-w-xl">
            <div>
              <label className="text-xs font-medium text-[#A0A0C8] block mb-1.5">
                Meta Page Access Token <span className="text-[#0084FF]">*</span>
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
                Facebook Page ID <span className="text-[#0084FF]">*</span>
              </label>
              <Input
                type="text"
                value={form.pageId}
                onChange={(e) => setForm({ ...form, pageId: e.target.value })}
                placeholder="e.g. 104523904928123"
                className="bg-[#0B0B1A] border-[#2A2A55] text-sm font-mono"
                required
              />
              <span className="text-[11px] text-[#A0A0C8] mt-1 block">
                Found in your Facebook Page About tab or Meta Business Suite.
              </span>
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="bg-[#0084FF] hover:bg-[#0070db] text-white border-0 text-sm font-medium mt-2"
            >
              {busy ? 'Verifying with Meta...' : 'Verify & Connect Messenger'}
            </Button>
          </form>
        </Card>
      )}

      {/* Meta Webhook Ingestion Configuration Guide */}
      <Card className="bg-[#161630] border-[#2A2A55] p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <AlertCircle className="w-4 h-4 text-[#0084FF]" /> Inbound Webhook Configuration (Meta Developer Portal)
        </div>
        <p className="text-xs text-[#A0A0C8] leading-relaxed">
          Configure this webhook in your Meta App to receive incoming Messenger messages from prospective clients:
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
