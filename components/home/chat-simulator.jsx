'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Share2, Send } from 'lucide-react'
import { useAuth, authFetch } from '@/lib/auth-context'
import { track } from '@/lib/analytics'

export function TypingDots() {
  return (
    <span className="inline-flex gap-1 items-center">
      <span className="w-1.5 h-1.5 bg-[#A0A0C8] rounded-full typing-dot" />
      <span className="w-1.5 h-1.5 bg-[#A0A0C8] rounded-full typing-dot" />
      <span className="w-1.5 h-1.5 bg-[#A0A0C8] rounded-full typing-dot" />
    </span>
  )
}

export function ChatSimulator({ agent, onSave }) {
  const { getToken } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [state, setState] = useState({ step: 0, qualified: false, booked: false, bookedSlot: null, tags: [] })
  // The server owns the transcript; `messages` is only what we render.
  const [conversationId, setConversationId] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => { scrollRef.current?.scrollTo?.({ top: 1e9, behavior: 'smooth' }) }, [messages, busy])

  useEffect(() => {
    // seed intro
    if (!agent) return
    setMessages([])
    setConversationId(null)
    setState({ step: 0, qualified: false, booked: false, bookedSlot: null, tags: [] })
    ;(async () => {
      setBusy(true)
      try {
        // No conversationId — the server opens the thread and hands one back.
        const res = await authFetch('/api/agent/chat', { method: 'POST', body: JSON.stringify({ agentId: agent.id }) }, getToken)
        const data = await res.json().catch(() => null)
        if (!res.ok || !data?.reply) throw new Error(data?.error || 'request failed')
        setConversationId(data.conversationId)
        setMessages([{ role: 'assistant', content: data.reply }])
      } catch (e) {
        toast.error(e.message === 'request failed' ? 'The AI is busy — try again in a moment' : 'Failed to start chat')
        setMessages([{ role: 'assistant', content: "Sorry, I couldn't start up just now — try again in a moment." }])
      }
      finally { setBusy(false) }
    })()
  }, [agent?.id])

  async function send() {
    if (!input.trim() || busy || !conversationId) return
    track('simulator_run', { agentId: agent?.id })
    const message = input.trim()
    const newMsgs = [...messages, { role: 'user', content: message }]
    setMessages(newMsgs)
    setInput('')
    setBusy(true)
    try {
      const res = await authFetch('/api/agent/chat', { method: 'POST', body: JSON.stringify({ agentId: agent.id, conversationId, message }) }, getToken)
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.reply) throw new Error(data?.error || 'request failed')
      setMessages([...newMsgs, { role: 'assistant', content: data.reply }])
      if (data.state) setState(data.state)
    } catch (e) {
      toast.error(e.message === 'request failed' ? "That got rate-limited — wait a few seconds and try again" : 'Network error')
    }
    finally { setBusy(false) }
  }

  async function saveAndShare() {
    if (!conversationId) return
    setBusy(true)
    try {
      const res = await authFetch('/api/result/save', { method: 'POST', body: JSON.stringify({ agentId: agent.id, conversationId }) }, getToken)
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.id) throw new Error(data?.error || 'save failed')
      const url = `${window.location.origin}/r/${data.id}`
      await navigator.clipboard.writeText(url).catch(()=>{})
      toast.success('Saved! Share link copied to clipboard.')
      window.open(`/r/${data.id}`, '_blank')
    } catch (e) {
      toast.error(e.message === 'save failed' ? "Couldn't save that transcript — try again" : 'Network error')
    } finally { setBusy(false) }
    onSave?.()
  }

  return (
    <Card className="bg-[#161630] border-[#2A2A55] p-0 overflow-hidden flex flex-col h-[640px] w-full max-w-md mx-auto elevate-purple">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2A2A55] bg-[#FF4D6D]/[0.06]">
        <div className="w-10 h-10 rounded-full bg-[#FF4D6D] text-[#0B0B1A] flex items-center justify-center font-bold">{agent?.agentName?.[0]?.toUpperCase() || 'C'}</div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{agent?.agentName || 'Coach'} • <span className="text-[#34D399] text-xs">AI active</span></div>
          <div className="text-xs text-[#A0A0C8]">DM simulator • Live preview</div>
        </div>
        <div className="flex flex-col gap-1 items-end text-[10px]">
          {state.qualified && <Badge className="bg-[#34D399]/20 text-[#34D399] border-0">Qualified</Badge>}
          {state.booked && <Badge className="bg-[#6B5BFF]/20 text-[#6B5BFF] border-0">Booked</Badge>}
        </div>
      </div>
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0B0B1A]/40">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-[#6B5BFF] text-white rounded-br-md' : 'bg-[#1F1F42] text-[#F5F5FA] rounded-bl-md'}`}>{m.content}</div>
          </div>
        ))}
        {busy && <div className="flex justify-start"><div className="bg-[#1F1F42] rounded-2xl px-4 py-3 rounded-bl-md"><TypingDots /></div></div>}
        {messages.length === 0 && !busy && <div className="text-center text-[#A0A0C8] text-sm py-10">Building your AI setter…</div>}
      </div>
      {/* Footer */}
      <div className="border-t border-[#2A2A55] p-3 bg-[#161630]">
        {state.booked ? (
          <Button onClick={saveAndShare} disabled={busy} className="btn-primary border-0 w-full font-semibold"><Share2 className="w-4 h-4 mr-2" /> Save & share result</Button>
        ) : (
          <div className="flex gap-2">
            <Input aria-label="Reply as the lead" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Reply as the lead…" className="bg-[#0B0B1A] border-[#2A2A55] text-white" disabled={busy} />
            <Button onClick={send} disabled={busy || !input.trim()} aria-label="Send reply" className="btn-primary border-0"><Send className="w-4 h-4" /></Button>
          </div>
        )}
        {!state.booked && messages.length > 2 && (
          <button onClick={saveAndShare} className="text-xs text-[#A0A0C8] hover:text-white mt-2 inline-flex items-center gap-1"><Share2 className="w-3 h-3" /> Save & share this transcript</button>
        )}
      </div>
    </Card>
  )
}
