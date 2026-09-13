'use client'
import { useEffect, useState } from 'react'
import { useAuth, authFetch } from '@/lib/auth-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, Webhook, Copy, Trash2, CheckCircle2 } from 'lucide-react'

// The only event the app emits today — lib/prospects.js onProspectBooked and
// POST /api/result/save both fire it. ponytail: no event picker until a second
// event exists to pick from.
const BOOKED_EVENT = 'appointment.booked'

export default function WebhooksSettings() {
  const { user, loading, getToken } = useAuth()
  const [webhooks, setWebhooks] = useState([])
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  // The signing secret is returned once, on creation, and never again.
  const [revealed, setRevealed] = useState(null)

  async function load() {
    try {
      const res = await authFetch('/api/webhooks', { method: 'GET' }, getToken)
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed to load webhooks')
      setWebhooks(d.webhooks || [])
    } catch (e) {
      toast.error(e.message || 'Failed to load webhooks')
    }
  }
  useEffect(() => { if (user) load() }, [user])

  async function add() {
    setBusy(true)
    try {
      const res = await authFetch('/api/webhooks', {
        method: 'POST',
        body: JSON.stringify({ url: url.trim(), events: [BOOKED_EVENT] }),
      }, getToken)
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed to add webhook')
      setRevealed({ url: d.url, secret: d.secret })
      setUrl('')
      toast.success('Webhook added')
      load()
    } catch (e) {
      toast.error(e.message || 'Failed to add webhook')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id) {
    setBusy(true)
    try {
      const res = await authFetch(`/api/webhooks/${id}`, { method: 'DELETE' }, getToken)
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Failed to delete webhook')
      toast.success('Webhook deleted')
      load()
    } catch (e) {
      toast.error(e.message || 'Failed to delete webhook')
    } finally {
      setBusy(false)
    }
  }

  async function copySecret() {
    try {
      await navigator.clipboard.writeText(revealed.secret)
      toast.success('Secret copied')
    } catch {
      toast.error('Copy failed — select the secret and copy it manually')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#A0A0C8]">Loading…</div>
  if (!user) return <div className="min-h-screen flex items-center justify-center text-[#A0A0C8]">Sign in to manage webhooks.</div>

  const urlIsHttps = /^https:\/\//.test(url.trim())

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-5 py-10">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[#A0A0C8] hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>
      <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-2"><Webhook className="w-6 h-6 text-[#6B5BFF]" /> Webhooks</h1>
      <p className="text-sm text-[#A0A0C8] mb-8">
        Get a signed POST every time a lead books a call — point it at Zapier, Make, or your own server.
      </p>

      {revealed && (
        <Card className="bg-[#161630] border-[#34D399]/40 p-6 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="font-semibold">Save your signing secret</div>
              <p className="text-xs text-[#A0A0C8] mt-1 mb-3">
                This is the only time it&apos;s shown. Verify each delivery by computing an HMAC-SHA256 of the raw
                request body with this secret and comparing it to the <code>X-DMForge-Signature</code> header.
              </p>
              <div className="flex gap-2">
                <Input readOnly aria-label="Webhook signing secret" value={revealed.secret} className="bg-[#0F0F26] border-[#2A2A55] font-mono text-xs" />
                <Button onClick={copySecret} variant="outline" aria-label="Copy signing secret" className="bg-transparent border-[#2A2A55]"><Copy className="w-4 h-4" /></Button>
              </div>
              <button onClick={() => setRevealed(null)} className="text-xs text-[#A0A0C8] hover:text-white mt-3">I&apos;ve saved it</button>
            </div>
          </div>
        </Card>
      )}

      <Card className="bg-[#161630] border-[#2A2A55] p-6 mb-6">
        <h3 className="font-display font-bold mb-1">Add a webhook</h3>
        <p className="text-xs text-[#A0A0C8] mb-3">Fires on <code>{BOOKED_EVENT}</code>. Must be an HTTPS URL.</p>
        <div className="flex gap-2">
          <Input aria-label="Webhook URL" placeholder="https://hooks.zapier.com/…" value={url} onChange={(e) => setUrl(e.target.value)} className="bg-[#0F0F26] border-[#2A2A55]" />
          <Button onClick={add} disabled={busy || !urlIsHttps} className="btn-primary border-0 text-sm shrink-0">Add</Button>
        </div>
      </Card>

      {webhooks.length === 0 ? (
        <p className="text-sm text-[#A0A0C8] text-center py-6">No webhooks yet.</p>
      ) : (
        <div className="space-y-3">
          {webhooks.map((w) => (
            <Card key={w.id} className="bg-[#161630] border-[#2A2A55] p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-mono truncate" title={w.url}>{w.url}</div>
                <div className="text-xs text-[#A0A0C8] mt-0.5">{(w.events || []).join(', ')} · {w.active ? 'active' : 'paused'}</div>
              </div>
              <Button onClick={() => remove(w.id)} disabled={busy} variant="outline" aria-label={`Delete webhook ${w.url}`} className="bg-transparent border-[#2A2A55] shrink-0"><Trash2 className="w-4 h-4" /></Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
