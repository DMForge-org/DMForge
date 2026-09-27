import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Wizard, NICHES } from '../home/wizard'
import { ChatSimulator } from '../home/chat-simulator'

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: null,
    getToken: vi.fn().mockResolvedValue('fake-token'),
    logout: vi.fn(),
  }),
  authFetch: vi.fn(),
}))

vi.mock('@/lib/analytics', () => ({
  track: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Home Components', () => {
  describe('Wizard', () => {
    it('renders initial step with niches and next button', () => {
      const onCreated = vi.fn()
      render(<Wizard onCreated={onCreated} />)

      expect(screen.getByText("What's your niche?")).toBeInTheDocument()
      expect(screen.getByText('Fitness / Weight loss')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument()
    })

    it('advances through wizard steps', () => {
      render(<Wizard onCreated={vi.fn()} />)

      // Step 0 -> Step 1
      fireEvent.click(screen.getByRole('button', { name: /Next/i }))
      expect(screen.getByText('What do you sell?')).toBeInTheDocument()

      // Step 1 -> Step 2
      fireEvent.click(screen.getByRole('button', { name: /Next/i }))
      expect(screen.getByText('What must they answer?')).toBeInTheDocument()

      // Step 2 -> Step 3
      fireEvent.click(screen.getByRole('button', { name: /Next/i }))
      expect(screen.getByText('How do you talk?')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Build my AI setter/i })).toBeInTheDocument()
    })

    it('has all expected niche definitions', () => {
      expect(NICHES.length).toBeGreaterThanOrEqual(8)
      expect(NICHES.map(n => n.id)).toContain('fitness')
      expect(NICHES.map(n => n.id)).toContain('business')
    })
  })

  describe('ChatSimulator', () => {
    it('renders agent header and status badges', () => {
      const agent = { id: 'agent-123', agentName: 'Coach Alex' }
      render(<ChatSimulator agent={agent} onSave={vi.fn()} />)

      expect(screen.getByText(/Coach Alex/i)).toBeInTheDocument()
      expect(screen.getByText(/AI active/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Reply as the lead…/i)).toBeInTheDocument()
    })
  })
})

