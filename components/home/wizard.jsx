'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react'
import { useAuth, authFetch } from '@/lib/auth-context'
import { track } from '@/lib/analytics'

export const NICHES = [
  { id: 'fitness', label: 'Fitness / Weight loss', emoji: '💪' },
  { id: 'nutrition', label: 'Nutrition coach', emoji: '🥗' },
  { id: 'business', label: 'Business / Make money', emoji: '💰' },
  { id: 'mindset', label: 'Mindset / Life coach', emoji: '🧠' },
  { id: 'course', label: 'Course creator', emoji: '🎓' },
  { id: 'agency', label: 'Agency / B2B', emoji: '📈' },
  { id: 'yoga', label: 'Yoga / Wellness', emoji: '🧘' },
  { id: 'therapist', label: 'Therapist / Healer', emoji: '✨' },
]

export function Wizard({ onCreated }) {
  const { getToken } = useAuth()
  const [step, setStep] = useState(0)
  const [niche, setNiche] = useState('fitness')
  const [agentName, setAgentName] = useState('Sarah')
  const [offer, setOffer] = useState('12-week 1:1 transformation coaching, $1,500. We work on training, nutrition and mindset weekly with check-ins.')
  const [audience, setAudience] = useState('Busy women 28-45 wanting to lose 5-20kg and keep it off without restrictive diets.')
  const [qualification, setQualification] = useState('Goal in kg, timeline, daily time commitment, budget readiness, biggest blocker')
  const [tone, setTone] = useState('warm, casual, direct, encouraging — like a friend who happens to be a pro coach')
  const [busy, setBusy] = useState(false)

  function goToStep(next) {
    if (step === 0 && next === 1) track('wizard_started', { niche })
    setStep(next)
  }

  async function build() {
    setBusy(true)
    try {
      const res = await authFetch('/api/agent/create', { method: 'POST', body: JSON.stringify({ niche, offer, audience, qualification, tone, agentName }) }, getToken)
      const data = await res.json()
      if (data.id) {
        toast.success('Your AI setter is live!')
        track('wizard_completed', { niche })
        track('agent_created', { agentId: data.id, niche })
        onCreated(data)
      } else toast.error(data.error || 'Failed')
    } catch (e) { toast.error('Failed to build') } finally { setBusy(false) }
  }

  return (
    <Card className="bg-[#161630] border-[#2A2A55] p-6 w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-[#A0A0C8] mb-4">
        {['Niche','Offer','Qualify','Tone'].map((s,i) => (
          <div key={s} className={`flex items-center gap-2 ${i === step ? 'text-white' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${i <= step ? 'bg-[#FF4D6D] text-[#0B0B1A]' : 'bg-[#2A2A55]'}`}>{i+1}</div>
            <span>{s}</span>
            {i < 3 && <ChevronRight className="w-3 h-3 opacity-50" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div>
          <h3 className="font-display text-2xl font-bold mb-2">What's your niche?</h3>
          <p className="text-[#A0A0C8] text-sm mb-4">We'll tune the AI's qualification script to your industry.</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {NICHES.map(n => (
              <button key={n.id} type="button" aria-pressed={niche === n.label} onClick={() => setNiche(n.label)} className={`text-left px-3 py-3 rounded-lg border text-sm transition ${niche === n.label ? 'border-[#FF4D6D] bg-[#FF4D6D]/10' : 'border-[#2A2A55] hover:border-[#6B5BFF]'}`}>
              <span className="mr-2">{n.emoji}</span>{n.label}</button>
            ))}
          </div>
          <Input aria-label="Your name (how the agent signs off)" value={agentName} onChange={e=>setAgentName(e.target.value)} placeholder="Your name (how it signs)" className="bg-[#0B0B1A] border-[#2A2A55] mb-3" />
          <Button onClick={()=>goToStep(1)} className="btn-primary border-0 w-full font-semibold">Next <ArrowRight className="w-4 h-4 ml-1" /></Button>
        </div>
      )}
      {step === 1 && (
        <div>
          <h3 className="font-display text-2xl font-bold mb-2">What do you sell?</h3>
          <p className="text-[#A0A0C8] text-sm mb-4">One paragraph. Price, what they get, length.</p>
          <Textarea aria-label="What you sell" value={offer} onChange={e=>setOffer(e.target.value)} rows={4} className="bg-[#0B0B1A] border-[#2A2A55] mb-3" />
          <Textarea aria-label="Your ideal client" value={audience} onChange={e=>setAudience(e.target.value)} rows={3} placeholder="Ideal client…" className="bg-[#0B0B1A] border-[#2A2A55] mb-3" />
          <div className="flex gap-2"><Button variant="outline" onClick={()=>setStep(0)} className="bg-transparent border-[#2A2A55]">Back</Button><Button onClick={()=>setStep(2)} className="btn-primary border-0 flex-1 font-semibold">Next <ArrowRight className="w-4 h-4 ml-1" /></Button></div>
        </div>
      )}
      {step === 2 && (
        <div>
          <h3 className="font-display text-2xl font-bold mb-2">What must they answer?</h3>
          <p className="text-[#A0A0C8] text-sm mb-4">List the qualification criteria, comma-separated.</p>
          <Textarea aria-label="Qualification criteria" value={qualification} onChange={e=>setQualification(e.target.value)} rows={4} className="bg-[#0B0B1A] border-[#2A2A55] mb-3" />
          <div className="flex gap-2"><Button variant="outline" onClick={()=>setStep(1)} className="bg-transparent border-[#2A2A55]">Back</Button><Button onClick={()=>setStep(3)} className="btn-primary border-0 flex-1 font-semibold">Next <ArrowRight className="w-4 h-4 ml-1" /></Button></div>
        </div>
      )}
      {step === 3 && (
        <div>
          <h3 className="font-display text-2xl font-bold mb-2">How do you talk?</h3>
          <p className="text-[#A0A0C8] text-sm mb-4">A line on tone. The AI will mimic this voice.</p>
          <Textarea aria-label="Tone of voice" value={tone} onChange={e=>setTone(e.target.value)} rows={3} className="bg-[#0B0B1A] border-[#2A2A55] mb-3" />
          <div className="flex gap-2"><Button variant="outline" onClick={()=>setStep(2)} className="bg-transparent border-[#2A2A55]">Back</Button><Button onClick={build} disabled={busy} className="btn-primary border-0 flex-1 font-semibold">{busy ? 'Forging…' : <><Sparkles className="w-4 h-4 mr-2" /> Build my AI setter</>}</Button></div>
        </div>
      )}
    </Card>
  )
}

