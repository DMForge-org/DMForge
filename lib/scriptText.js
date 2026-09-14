// Detects unfilled template slots in generated DM scripts.
//
// Gemini, asked for an opening DM "after a comment/follow", reaches for slots it
// can't fill — "[Name]", "[mention post topic if applicable, otherwise remove
// this part]". Every script string below is sent to a real lead verbatim (the
// intro directly, the rest via the chat prompt), so a surviving slot is a
// visibly broken message. Measured 2026-09-14: 9 of 17 stored agents had one.

// ponytail: any square-bracket span counts. A coach who genuinely types square
// brackets in a DM would trip this; narrow it to a word list if that happens.
const PLACEHOLDER = /\[[^[\]\n]{1,120}\]/g

export function findPlaceholders(text) {
  if (typeof text !== 'string') return []
  return text.match(PLACEHOLDER) || []
}

// The script fields a lead can end up reading. `why` and `tonePrompt` are
// internal guidance and never sent, so they are not checked.
function leadFacingFields(script) {
  const questions = Array.isArray(script?.questions) ? script.questions : []
  return [
    ['intro', script?.intro],
    ...questions.map((q, i) => [`questions[${i}].ask`, q?.ask]),
    ['bookingMessage', script?.bookingMessage],
    ['disqualifyResponse', script?.disqualifyResponse],
  ]
}

export function scriptPlaceholders(script) {
  return leadFacingFields(script).flatMap(([field, text]) =>
    findPlaceholders(text).map((placeholder) => ({ field, placeholder })),
  )
}
