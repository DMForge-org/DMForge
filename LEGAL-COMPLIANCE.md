# DMForge — legal & regulatory compliance notes

**This is not legal advice.** It's research grounded in primary/regulator sources and this codebase, done to scope what needed fixing and what still needs a solicitor's or accountant's sign-off before you rely on it. Last verified: September 2026.

## Business snapshot

DMForge is operated as a **UK-based sole trader** (per `app/legal/terms` and `app/legal/privacy`, confirmed current). That makes UK law — UK GDPR, the Data Protection Act 2018, PECR, and the Consumer Protection from Unfair Trading Regulations 2008 (CPUT) — the primary framework. Several channels and vendors (Twilio, LinkedIn, Stripe) are US-governed, so US rules apply on top where relevant.

Live outbound channels today: **LinkedIn DMs** (`lib/linkedin.js`) and **email** (`lib/email.js`, cold outreach) are real and working. **SMS** (`lib/sms.js`) is reminder-only, not marketing. **Instagram/WhatsApp/Messenger are not built** — `PROSPECT_CHANNELS` in `lib/prospects.js` only supports `linkedin`, `email`, `sms`, `manual`.

## Fixed this pass

- False advertising exposure: homepage/README/GitHub description claimed Instagram/WhatsApp/Messenger automation that doesn't exist (CPUT Regs 2008 / FTC Act §5 risk). Corrected copy to the real channels.
- No cookie-consent gate despite PostHog actively initializing on every page load (`components/analytics-provider.jsx` called `initAnalytics()` unconditionally). Added a consent banner (`components/cookie-consent.jsx`) gating it — UK PECR reg. 6 requires consent before non-essential storage/cookies.
- No unsubscribe mechanism on the cold-email outreach channel. Added a signed unsubscribe link in every outreach email footer plus a per-user suppression list checked before send (CAN-SPAM 15 U.S.C. §7704; PECR reg. 22 soft opt-in/opt-out).
- No opt-out handling on SMS. Added "Reply STOP to opt out" to the reminder template, a suppression check before send, and a signature-verified inbound Twilio webhook handling STOP/START/HELP (CTIA Messaging Principles; TCPA 47 U.S.C. §227).
- Repo hygiene: added `LICENSE` (proprietary — you chose to keep the repo public), `SECURITY.md`, `CODEOWNERS`, issue/PR templates.

## Fixed in round 2 (content-audit follow-up)

- 6 of 12 seeded blog posts in `lib/blog.js` gave literal false step-by-step instructions ("Connect Instagram via OAuth," etc.) for a channel that doesn't exist — rewritten around LinkedIn/email, with the two most Instagram-specific ones reslugged to match their new content (`linkedin-outreach-automation-without-getting-restricted`, `how-dmforge-qualifies-replies-automatically`). One of the rewrites (the ban-avoidance guide) is now honest about LinkedIn's own real automation risk rather than promising false safety.
- Two functional bugs found in the same pass, unrelated to content: `app/r/[id]/page.js` hardcoded "Instagram DM transcript" on every shared result regardless of actual channel (fixed to a channel-neutral label — the underlying `results` data doesn't track per-record channel, so a neutral label is the honest fix, not a fabricated dynamic one); `app/inbox/page.js`'s Add Lead form defaulted new leads to `'instagram'`, a channel not in `PROSPECT_CHANNELS` (fixed default to `'manual'`, removed from the dropdown).
- Deliberately **not** changed, per your call: `/best/instagram-dm-bot`, `/best/whatsapp-ai-agent`, and their `app/sitemap.js` entries. The rendered page copy doesn't literally claim a channel (no `channels` field renders on `/best/*` cards) — the exposure there is implied-by-search-ranking, not a false sentence, and you chose to accept that rather than pull traffic-earning pages.

## UK baseline

- **UK GDPR / DPA 2018**: `app/legal/privacy` already commits to fulfilling access/erasure/portability requests manually within 30 days — that's a compliant floor. Worth noting: prospect PII (name/phone/email) is stored in plaintext in Firestore (`lib/prospects.js`); only channel *credentials* are encrypted (`lib/encryption.js`). Firestore encrypts at rest at the infrastructure level, so this isn't automatically non-compliant, but Article 32's "appropriate technical measures" is a risk-based judgment call worth revisiting as lead volume grows.
- **PECR**: cookie consent gap fixed above. The same regulation (reg. 22) governs unsolicited email/SMS marketing to individuals — the "soft opt-in" exception (existing customer relationship, similar products, clear opt-out offered) is the most plausible basis for the cold-outreach email/LinkedIn flows, but that exception has conditions worth confirming apply to how coaches actually use DMForge (are recipients existing customers of *the coach*, or cold prospects? — the latter needs explicit consent, not soft opt-in).
- **CPUT Regs 2008**: covers the false-advertising angle above. `lib/competitors.js`, `app/vs/[slug]/page.js`, and `app/page.js`'s comparison table were checked and are clean — every Instagram/WhatsApp/Messenger mention there correctly describes a *competitor's* channels, not DMForge's. `lib/blog.js` and `app/r/[id]/page.js` had real issues, now fixed (see round 2 above). `/best/[slug]` SEO pages were a deliberate keep (see round 2).
- **Trading disclosure**: the Ecommerce Regulations 2002 require a site to name the actual trader (legal name) and a geographic address, not just "a UK-based sole trader." The current legal pages don't name you. I didn't add a name because I don't have it and won't fabricate one — see open questions below.

## US-facing gaps (channels/vendors are US-governed)

- **TCPA** (47 U.S.C. §227) and FCC rules: govern the SMS reminder channel. Reminders are transactional, not marketing, which lowers the consent bar somewhat, but the FCC's 2025 restoration of "prior express written consent" as the default standard (except the Fifth Circuit post-*Bradford v. Sovereign Pest Control*, Feb 2026) means written consent at booking time is the safe baseline. Confirm the booking flow actually captures it.
- **CAN-SPAM**: fixed via the unsubscribe link. Also required: honoring opt-outs within 10 business days (the suppression check is checked at send-time, so this is effectively instant) and keeping the mechanism live 30+ days post-send (it's permanent, so this is satisfied).
- **California SB 1001 (B.O.T. Act)**: requires disclosing bot use when incentivizing a sale to a person in California, enforced by the CA AG under unfair-competition law. Applies if any leads DMForge contacts are California-based.
- **FTC**: has been active in 2026 on AI/chatbot deceptive-practice enforcement — a statement that would be deceptive from a human is still deceptive from an AI. Relevant to script-generation quality (unfilled placeholders, unsubstantiated claims), not just disclosure.

## EU AI Act Article 50 (enforceable from 2 August 2026)

Requires disclosing to a person that they're interacting with AI, "before or at the very beginning" of the interaction — a disclosure buried in a privacy policy doesn't count; it has to be perceivable in the conversation itself. Applies if DMForge (or a coach using it) contacts anyone in the EU.

**This is the one real tension I did not code around, on purpose.** The script-generation prompt in `app/api/[[...path]]/route.js` (`/api/agent/create`, ~line 167) explicitly instructs the model to write DMs that "sound like a human coach typing on phone, never robotic" — and that generated `intro`/`bookingMessage` text is sent to real leads verbatim. Adding an explicit AI-disclosure line to every first message is a product/conversion decision as much as a legal one — it changes the tone of the entire cold-outreach flow the business is built around. Options, roughly in order of how much they change the product:
1. Add a subtle, one-time disclosure line to the generated intro (e.g., a short "(AI-assisted)" tag) — smallest compliance fix, some conversion cost.
2. Geofence the disclosure to leads with an EU/California signal only, if that's ever detectable — reduces the tradeoff but adds complexity and isn't airtight.
3. Accept the risk for now if your customer base and their leads are predominantly UK/US outside California, and revisit before actively marketing to EU-based coaches or their leads.
This needs your call, ideally with a solicitor's read on how strictly "before or at the very beginning" would be enforced against a UK sole trader with mostly non-EU traffic.

## Platform-specific (flagged, not auto-fixed)

- **LinkedIn User Agreement**: prohibits automation tools for messaging. `lib/linkedin.js` sends real automated DMs through an unofficial OAuth integration — this is a live feature, and the ToS risk (account restriction, not a fine) is a business decision about how much of the product depends on it, not something with a code fix.
- **Meta / Instagram Messaging API**: not relevant today since Instagram isn't built. If it's ever built, Meta requires the official Instagram Messaging API, Business Verification, and App Review (2-4+ weeks), plus a 24-hour messaging window and ~200 msg/hour rate limit — automating Instagram DMs outside that official path is itself a ToS violation, separate from the false-advertising issue already fixed.

## Stripe restricted-business terms — resolved

Fetched `stripe.com/legal/restricted-businesses` directly (round 1 only had marketing-sourced secondary pages). Confirmed: no category for automated messaging/DM tools, marketing/lead-gen SaaS, or AI agents. The only plausibly-relevant entry is a bare, undefined "Telemarketing" line under Prohibited Businesses, with no elaboration on the page itself. Telemarketing conventionally means unsolicited outbound *voice* calls, which isn't what DMForge does (text-based LinkedIn/email outreach, SMS reminders) — so this likely doesn't apply. "Likely" is as far as primary-source research alone can take it; Stripe's own page doesn't define the term, so if you want certainty, ask Stripe support directly rather than treat this as fully closed.

## Open questions for your accountant/solicitor (not answered here)

1. **Sole-trader liability**: you're personally liable while processing client leads' PII and running payment collection through Stripe. Worth a second look given the scale, not just accepted by default because it's how things started.
2. **Your actual trading name and address** for the Ecommerce Regs trading-disclosure requirement above — I don't have it and didn't invent one.
3. **The EU AI Act disclosure tension** above.

## Sources consulted this session

- [California's BOT Disclosure Law, SB 1001](https://natlawreview.com/article/california-s-bot-disclosure-law-sb-1001-now-effect)
- [EU AI Act Article 50 — Transparency Obligations](https://artificialintelligenceact.eu/article/50/)
- [FTC: CAN-SPAM Act Compliance Guide for Business](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)
- [TCPA text messages: Rules and regulations guide for 2026](https://activeprospect.com/blog/tcpa-text-messages/)
- [Twilio: Webhooks security](https://www.twilio.com/docs/usage/webhooks/webhooks-security)
- [Instagram Messaging API Approval Guide (2026)](https://singhamandeep.com/instagram-messaging-api-approval-getting-instagram_business_manage_messages-2026/)
- Meta Instagram DM automation rate limits/24-hour window: aggregated from multiple 2026 developer guides (Spur, Blotato, keyapi.ai) — cross-check against `developers.facebook.com/documentation/instagram-platform` directly before building.
- [Stripe: Prohibited and Restricted Businesses](https://stripe.com/legal/restricted-businesses) — fetched directly, round 2.
