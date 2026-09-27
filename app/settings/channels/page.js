'use client'

import { useEffect, useState } from 'react'
import { useAuth, authFetch } from '@/lib/auth-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { toast } from 'sonner'
import { Mail, CheckCircle2, MessageSquare, MessageCircle, ArrowRight, Settings2 } from 'lucide-react'

function InstagramIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

export default function ChannelsSettings() {
  const { user, loading, getToken } = useAuth()
  const [channels, setChannels] = useState([])
  const [busy, setBusy] = useState(false)
  const [gmail, setGmail] = useState({ user: '', pass: '' })
  const [smtp, setSmtp] = useState({ host: '', port: '587', user: '', pass: '' })
  const [twilio, setTwilio] = useState({ accountSid: '', authToken: '', from: '' })

  async function loadChannels() {
    try {
      const res = await authFetch('/api/channels', { method: 'GET' }, getToken)
      const data = await res.json()
      setChannels(data.channels || [])
    } catch {
      toast.error('Failed to load channels')
    }
  }

  useEffect(() => {
    if (user) loadChannels()
  }, [user])

  const instagramChannel = channels.find((c) => c.id === 'instagram')
  const messengerChannel = channels.find((c) => c.id === 'messenger')
  const smsChannel = channels.find((c) => c.id === 'sms')
  const emailChannel = channels.find((c) => c.id === 'email')

  async function disconnectInstagram() {
    setBusy(true)
    try {
      await authFetch('/api/channels/instagram', { method: 'DELETE' }, getToken)
      toast.success('Instagram disconnected')
      loadChannels()
    } catch {
      toast.error('Failed to disconnect Instagram')
    } finally {
      setBusy(false)
    }
  }

  async function disconnectMessenger() {
    setBusy(true)
    try {
      await authFetch('/api/channels/messenger', { method: 'DELETE' }, getToken)
      toast.success('Messenger disconnected')
      loadChannels()
    } catch {
      toast.error('Failed to disconnect Messenger')
    } finally {
      setBusy(false)
    }
  }

  async function connectSms() {
    setBusy(true)
    try {
      const res = await authFetch('/api/channels/sms/connect', { method: 'POST', body: JSON.stringify(twilio) }, getToken)
      const d = await res.json()
      if (d.success) {
        toast.success('Twilio connected')
        loadChannels()
      } else {
        toast.error(d.error || 'Connection failed')
      }
    } catch {
      toast.error('Connection failed')
    } finally {
      setBusy(false)
    }
  }

  async function disconnectSms() {
    setBusy(true)
    try {
      await authFetch('/api/channels/sms', { method: 'DELETE' }, getToken)
      toast.success('Twilio disconnected')
      loadChannels()
    } catch {
      toast.error('Failed to disconnect')
    } finally {
      setBusy(false)
    }
  }

  async function connectEmail(provider, creds) {
    setBusy(true)
    try {
      const res = await authFetch('/api/channels/email/connect', { method: 'POST', body: JSON.stringify({ provider, ...creds }) }, getToken)
      const data = await res.json()
      if (data.success) {
        toast.success('Email connected')
        loadChannels()
      } else {
        toast.error(data.error || 'Connection failed')
      }
    } catch {
      toast.error('Connection failed')
    } finally {
      setBusy(false)
    }
  }

  async function disconnectEmail() {
    setBusy(true)
    try {
      await authFetch('/api/channels/email', { method: 'DELETE' }, getToken)
      toast.success('Disconnected')
      loadChannels()
    } catch {
      toast.error('Failed to disconnect')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="text-[#A0A0C8] py-8">Loading channels…</div>
  if (!user) return <div className="text-[#A0A0C8] py-8">Sign in to manage channels.</div>

  return (
    <div className="space-y-6">
      {/* Instagram DM Channel Card */}
      <Card className="bg-[#161630] border-[#2A2A55] p-6 transition-all hover:border-[#FD1D1D]/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] flex items-center justify-center text-white shrink-0">
              <InstagramIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Instagram Direct Messaging</span>
                {instagramChannel?.connected && (
                  <Badge className="bg-[#34D399]/20 text-[#34D399] border-[#34D399]/30 text-[10px]">
                    <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Connected
                  </Badge>
                )}
              </div>
              <div className="text-xs text-[#A0A0C8] mt-0.5">
                {instagramChannel?.connected
                  ? `Active on @${instagramChannel.username || instagramChannel.name || instagramChannel.instagramAccountId}`
                  : 'Qualify and book leads directly in Instagram DMs via Meta Graph API'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {instagramChannel?.connected ? (
              <>
                <Link href="/settings/channels/instagram">
                  <Button variant="outline" className="bg-transparent border-[#2A2A55] text-xs">
                    <Settings2 className="w-3.5 h-3.5 mr-1.5" /> Manage
                  </Button>
                </Link>
                <Button
                  onClick={disconnectInstagram}
                  disabled={busy}
                  variant="outline"
                  className="bg-transparent border-[#2A2A55] hover:border-red-500/50 hover:bg-red-500/10 text-red-400 text-xs"
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Link href="/settings/channels/instagram">
                <Button className="btn-primary border-0 text-xs">
                  Connect Instagram <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>

      {/* Facebook Messenger Channel Card */}
      <Card className="bg-[#161630] border-[#2A2A55] p-6 transition-all hover:border-[#0084FF]/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#0084FF] flex items-center justify-center text-white shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Facebook Messenger</span>
                {messengerChannel?.connected && (
                  <Badge className="bg-[#34D399]/20 text-[#34D399] border-[#34D399]/30 text-[10px]">
                    <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Connected
                  </Badge>
                )}
              </div>
              <div className="text-xs text-[#A0A0C8] mt-0.5">
                {messengerChannel?.connected
                  ? `Active on Page: ${messengerChannel.name || messengerChannel.pageId}`
                  : 'Automate high-converting appointment booking on your Facebook Page'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messengerChannel?.connected ? (
              <>
                <Link href="/settings/channels/messenger">
                  <Button variant="outline" className="bg-transparent border-[#2A2A55] text-xs">
                    <Settings2 className="w-3.5 h-3.5 mr-1.5" /> Manage
                  </Button>
                </Link>
                <Button
                  onClick={disconnectMessenger}
                  disabled={busy}
                  variant="outline"
                  className="bg-transparent border-[#2A2A55] hover:border-red-500/50 hover:bg-red-500/10 text-red-400 text-xs"
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Link href="/settings/channels/messenger">
                <Button className="bg-[#0084FF] hover:bg-[#0070db] text-white border-0 text-xs font-semibold">
                  Connect Messenger <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>

      {/* SMS / Twilio */}
      {smsChannel?.connected ? (
        <Card className="bg-[#161630] border-[#2A2A55] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-[#34D399]" />
              <div>
                <div className="font-semibold text-white">SMS Connected (Twilio)</div>
                <div className="text-xs text-[#A0A0C8]">From {smsChannel.email}</div>
              </div>
            </div>
            <Button
              onClick={disconnectSms}
              disabled={busy}
              variant="outline"
              className="bg-transparent border-[#2A2A55] text-xs"
            >
              Disconnect
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="bg-[#161630] border-[#2A2A55] p-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-[#6B5BFF]" />
            <h3 className="font-display font-bold text-white">Connect SMS (Twilio)</h3>
          </div>
          <p className="text-xs text-[#A0A0C8] mb-4">
            Send 24h & 1h appointment reminders via SMS to reduce no-shows.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <Input
              placeholder="Account SID"
              value={twilio.accountSid}
              onChange={(e) => setTwilio({ ...twilio, accountSid: e.target.value })}
              className="bg-[#0B0B1A] border-[#2A2A55] text-xs"
            />
            <Input
              type="password"
              placeholder="Auth Token"
              value={twilio.authToken}
              onChange={(e) => setTwilio({ ...twilio, authToken: e.target.value })}
              className="bg-[#0B0B1A] border-[#2A2A55] text-xs"
            />
            <Input
              placeholder="From Number (+1...)"
              value={twilio.from}
              onChange={(e) => setTwilio({ ...twilio, from: e.target.value })}
              className="bg-[#0B0B1A] border-[#2A2A55] text-xs"
            />
          </div>
          <Button
            onClick={connectSms}
            disabled={busy || !twilio.accountSid || !twilio.authToken || !twilio.from}
            className="btn-primary border-0 text-xs"
          >
            Connect Twilio
          </Button>
        </Card>
      )}

      {/* Email / SMTP */}
      {emailChannel?.connected ? (
        <Card className="bg-[#161630] border-[#2A2A55] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#3B82F6]" />
              <div>
                <div className="font-semibold text-white">
                  Email Connected ({emailChannel.provider === 'gmail' ? 'Gmail' : 'Custom SMTP'})
                </div>
                <div className="text-xs text-[#A0A0C8]">{emailChannel.email}</div>
              </div>
            </div>
            <Button
              onClick={disconnectEmail}
              disabled={busy}
              variant="outline"
              className="bg-transparent border-[#2A2A55] text-xs"
            >
              Disconnect
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="bg-[#161630] border-[#2A2A55] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-[#3B82F6]" />
              <h3 className="font-display font-bold text-white">Connect Gmail (App Password)</h3>
            </div>
            <p className="text-xs text-[#A0A0C8] mb-4">
              Connect your Gmail account using a 16-character App Password.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <Input
                placeholder="your.email@gmail.com"
                value={gmail.user}
                onChange={(e) => setGmail({ ...gmail, user: e.target.value })}
                className="bg-[#0B0B1A] border-[#2A2A55] text-xs"
              />
              <Input
                type="password"
                placeholder="16-character App Password"
                value={gmail.pass}
                onChange={(e) => setGmail({ ...gmail, pass: e.target.value })}
                className="bg-[#0B0B1A] border-[#2A2A55] text-xs"
              />
            </div>
            <Button
              onClick={() => connectEmail('gmail', gmail)}
              disabled={busy || !gmail.user || !gmail.pass}
              className="btn-primary border-0 text-xs"
            >
              Connect Gmail
            </Button>
          </Card>

          <Card className="bg-[#161630] border-[#2A2A55] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-[#A0A0C8]" />
              <h3 className="font-display font-bold text-white">Connect Custom SMTP</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <Input
                placeholder="SMTP Host (e.g. smtp.mailgun.org)"
                value={smtp.host}
                onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                className="bg-[#0B0B1A] border-[#2A2A55] text-xs"
              />
              <Input
                placeholder="Port (e.g. 587)"
                value={smtp.port}
                onChange={(e) => setSmtp({ ...smtp, port: e.target.value })}
                className="bg-[#0B0B1A] border-[#2A2A55] text-xs"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <Input
                placeholder="Username / Email"
                value={smtp.user}
                onChange={(e) => setSmtp({ ...smtp, user: e.target.value })}
                className="bg-[#0B0B1A] border-[#2A2A55] text-xs"
              />
              <Input
                type="password"
                placeholder="Password"
                value={smtp.pass}
                onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })}
                className="bg-[#0B0B1A] border-[#2A2A55] text-xs"
              />
            </div>
            <Button
              onClick={() => connectEmail('smtp', smtp)}
              disabled={busy || !smtp.host || !smtp.user || !smtp.pass}
              className="btn-primary border-0 text-xs"
            >
              Connect SMTP
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
