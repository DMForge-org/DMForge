import { test, expect } from '@playwright/test'
import { findPlaceholders, scriptPlaceholders } from '../../lib/scriptText.js'

// POST /api/agent/create refuses to save a script this flags, and
// /api/agent/chat swaps a flagged stored intro for a default, so a false
// negative here means a lead reads "[Name]".

test('finds the placeholders Gemini actually produced in production', () => {
  expect(findPlaceholders("I loved your comment on [mention post topic if applicable, otherwise remove this part]. How's your day?"))
    .toEqual(['[mention post topic if applicable, otherwise remove this part]'])
  expect(findPlaceholders('Hey [Name], based on [mention specific reason, e.g., your current timeline/budget], not a fit'))
    .toEqual(['[Name]', '[mention specific reason, e.g., your current timeline/budget]'])
})

test('clean copy has no placeholders', () => {
  expect(findPlaceholders("hey! saw you're into fitness — what's your main goal right now?")).toEqual([])
  expect(findPlaceholders('booked ✅ Tomorrow 2:00pm — confirmation on its way')).toEqual([])
})

test('non-strings are treated as clean rather than throwing', () => {
  expect(findPlaceholders(undefined)).toEqual([])
  expect(findPlaceholders(null)).toEqual([])
  expect(findPlaceholders(42)).toEqual([])
})

test('checks every lead-facing field and names where each leak is', () => {
  const script = {
    intro: 'Hey [Name]!',
    questions: [
      { key: 'goal', ask: 'what are you working toward?', why: 'fine' },
      { key: 'timeline', ask: 'by when for [goal]?', why: 'fine' },
    ],
    bookingMessage: 'want to hop on a call?',
    disqualifyResponse: 'not a fit because of [reason]',
    tonePrompt: 'warm',
  }
  expect(scriptPlaceholders(script)).toEqual([
    { field: 'intro', placeholder: '[Name]' },
    { field: 'questions[1].ask', placeholder: '[goal]' },
    { field: 'disqualifyResponse', placeholder: '[reason]' },
  ])
})

test('internal-only fields are not checked', () => {
  const script = {
    intro: 'hey there!',
    questions: [{ key: 'budget', ask: 'ready to invest?', why: 'to qualify for [price]' }],
    bookingMessage: 'call?',
    disqualifyResponse: 'no worries!',
    tonePrompt: 'mirror their [energy]',
  }
  expect(scriptPlaceholders(script)).toEqual([])
})

test('a malformed script does not throw', () => {
  expect(scriptPlaceholders(null)).toEqual([])
  expect(scriptPlaceholders({ questions: 'not-an-array' })).toEqual([])
  expect(scriptPlaceholders({ questions: [null, { ask: 5 }] })).toEqual([])
})
