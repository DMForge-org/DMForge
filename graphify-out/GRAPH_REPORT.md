# Graph Report - DMForge  (2026-10-08)

## Corpus Check
- 224 files · ~112,472 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: (none) 17, .example 1, .code-workspace 1)

## Summary
- 1355 nodes · 2849 edges · 98 communities (70 shown, 28 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 51 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b3b586be`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react
- dependencies
- best/[slug]/page.js
- authFetch
- backend_test.py
- cn
- sidebar.jsx
- [[...path]]/route.js
- functions/package.json
- package.json
- @playwright/test
- health/route.js
- utils.js
- alert-dialog.jsx
- menubar.jsx
- prod-verify — recipes
- components.json
- biome.json
- form.jsx
- app/layout.js
- navigation-menu.jsx
- UnauthorizedError
- schemas.js
- chart.jsx
- carousel.jsx
- drawer.jsx
- toggle-group.jsx
- breadcrumb.jsx
- app/page.js
- @sentry/nextjs
- paths
- reminderService.js
- dropdown-menu.jsx
- devDependencies
- resolutions
- webhookService.js
- compilerOptions
- Project: DMForge — AI DM setter builder + Stripe-enabled SaaS
- logError
- scripts
- analytics.js
- avatar.jsx
- ValidationError
- functions/index.js
- contact/page.js
- privacy/page.js
- terms/page.js
- The workflow
- sonner.jsx
- CI Workflow
- .mcp.json
- repository
- DMForge Apple Icon (PNG)
- DMForge
- @radix-ui/react-aspect-ratio
- @radix-ui/react-collapsible
- tabs.jsx
- next.config.js
- vercel.json
- The workflow
- DMForge Deployment Runbook
- Emergent Config
- Bug Report Template
- Feature Request Template
- Pull Request Template
- Legal & Regulatory Compliance Notes
- getBaseUrl
- Verification Before Completion
- next
- main
- Known gaps log — DMForge frontend
- Known gaps log — DMForge frontend
- Shipping DMForge
- Shipping DMForge
- Reconciled facts — where DMForge's docs drift from reality
- auth-context.js
- Reconciled facts — where DMForge's docs drift from reality
- Auditing DMForge's frontend
- Auditing DMForge's frontend
- DMForge E2E — real-browser click tests (Playwright)
- Part 1 — Bright Data onboarding (lead enrichment for DMForge)
- input-otp.jsx
- Env var checklist — DMForge
- Env var checklist — DMForge
- solo-business-copilot.md
- Security Policy
- vitest.config.mjs
- CLEAN_CODE_REPORT.md
- engines
- @testing-library/jest-dom

## God Nodes (most connected - your core abstractions)
1. `cn()` - 221 edges
2. `authFetch()` - 66 edges
3. `react` - 64 edges
4. `UnauthorizedError` - 53 edges
5. `handleRoute()` - 50 edges
6. `ValidationError` - 41 edges
7. `lucide-react` - 34 edges
8. `main()` - 31 edges
9. `useAuth()` - 28 edges
10. `logError()` - 28 edges

## Surprising Connections (you probably didn't know these)
- `2026-09-04 audit` --references--> `ChatSimulator()`  [INFERRED]
  .agents/skills/auditing-dmforge-frontend/references/known-gaps.md → components/home/chat-simulator.jsx
- `2026-09-04 audit` --references--> `ChatSimulator()`  [INFERRED]
  .claude/skills/auditing-dmforge-frontend/references/known-gaps.md → components/home/chat-simulator.jsx
- `Recommendations` --references--> `authFetch()`  [INFERRED]
  test_result.md → lib/auth-context.js
- `Test Coverage` --references--> `authFetch()`  [INFERRED]
  test_result.md → lib/auth-context.js
- `Before telling anyone a channel/integration is "shippable"` --references--> `sendReminders()`  [INFERRED]
  .agents/skills/shipping-dmforge/references/env-checklist.md → functions/index.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Design Governance Stack** — impeccable_design_context, figma_design_system, brand_tokens [EXTRACTED 1.00]

## Communities (98 total, 28 thin omitted)

### Community 0 - "react"
Cohesion: 0.20
Nodes (15): ProspectCard(), relTime(), STATUS_STYLE, STATUSES, ThreadDrawer(), GREETING, Badge(), badgeVariants (+7 more)

### Community 1 - "dependencies"
Cohesion: 0.03
Nodes (68): dependencies, axios, class-variance-authority, clsx, cmdk, date-fns, dayjs, dotenv (+60 more)

### Community 2 - "best/[slug]/page.js"
Cohesion: 0.09
Nodes (25): BestPage(), FIXED_PAGES, generateMetadata(), NICHES, parseSlug(), RANKING, CLUSTER, metadata (+17 more)

### Community 3 - "authFetch"
Cohesion: 0.08
Nodes (44): Dashboard(), portal(), FollowUpSequence(), generate(), saveEdit(), InboxPage(), createLead(), loadInboundUrl() (+36 more)

### Community 4 - "backend_test.py"
Cohesion: 0.08
Nodes (36): print_test(), Test POST /api/agent/chat - empty messages returns intro, Test POST /api/agent/chat - multi-turn conversation, Test POST /api/result/save, DMForge Backend API Test Suite Tests all endpoints at https://insight-…, Test GET /api/ - health check, Test GET /api/result/:id, Test GET /api/competitors (+28 more)

### Community 5 - "cn"
Cohesion: 0.06
Nodes (49): CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Command, CommandEmpty, CommandGroup (+41 more)

### Community 6 - "sidebar.jsx"
Cohesion: 0.06
Nodes (41): Separator, components_ui_sheet_sheet, SheetContent, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle (+33 more)

### Community 7 - "[[...path]]/route.js"
Cohesion: 0.10
Nodes (48): agentDenied(), ALLOWED_ORIGINS, CHANNEL_LABELS, CHAT_TURN_SCHEMA, DELETE, EMPTY_CHAT_STATE, formatPrice(), GET (+40 more)

### Community 8 - "functions/package.json"
Cohesion: 0.13
Nodes (14): dependencies, firebase-admin, firebase-functions, description, engines, node, firebase-admin, main (+6 more)

### Community 9 - "package.json"
Cohesion: 0.06
Nodes (33): homepage, firebase-admin, license, name, packageManager, private, version, autoprefixer (+25 more)

### Community 10 - "@playwright/test"
Cohesion: 0.06
Nodes (21): BOOKED_CONFIRMATION, deriveResultState(), findPlaceholders(), leadFacingFields(), scriptPlaceholders(), { defineConfig, devices }, IMPORTANT: Defaults to localhost (safe for local/CI testing)., @playwright/test (+13 more)

### Community 11 - "health/route.js"
Cohesion: 0.09
Nodes (38): checkFirestore(), checkGemini(), checkStripe(), dynamic, GET(), dynamic, POST(), syncSubscription() (+30 more)

### Community 12 - "utils.js"
Cohesion: 0.05
Nodes (25): AccordionContent, AccordionItem, AccordionTrigger, Checkbox, HoverCardContent, PopoverContent, Progress, RadioGroup (+17 more)

### Community 13 - "alert-dialog.jsx"
Cohesion: 0.11
Nodes (20): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle (+12 more)

### Community 14 - "menubar.jsx"
Cohesion: 0.11
Nodes (12): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+4 more)

### Community 15 - "prod-verify — recipes"
Cohesion: 0.09
Nodes (21): 1. Page + link crawl, 2. Endpoint discovery from the client bundle, 3. Real registration + authed journey (Firebase Auth REST), 4. Vercel: runtime logs, env vars, redeploy (CLI), 5.1 Stripe & HTTP header credential gotchas, 5. Firebase Admin credential failure-mode → fix table, 6. Stripe checkout / portal verification, 7. Minimal reusable Playwright setup (+13 more)

### Community 16 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 17 - "biome.json"
Cohesion: 0.05
Nodes (41): source, assist, actions, noUnusedImports, noUnusedVariables, files, includes, formatter (+33 more)

### Community 18 - "form.jsx"
Cohesion: 0.17
Nodes (13): FormControl, FormDescription, FormFieldContext, FormItem, FormItemContext, FormLabel, FormMessage, useFormField() (+5 more)

### Community 19 - "app/layout.js"
Cohesion: 0.14
Nodes (10): app_globals, baseUrl, body, display, metadata, Providers(), Footer(), SupportChat() (+2 more)

### Community 20 - "navigation-menu.jsx"
Cohesion: 0.25
Nodes (8): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport, @radix-ui/react-navigation-menu

### Community 21 - "UnauthorizedError"
Cohesion: 0.17
Nodes (22): BadGatewayError, UnauthorizedError, sendMetaMessage(), verifyMetaInstagramToken(), verifyMetaPageToken(), validate(), connectEmailChannel(), connectInstagramChannel() (+14 more)

### Community 22 - "schemas.js"
Cohesion: 0.15
Nodes (23): buildOpenApiSpec(), buildOperation(), errorResponse(), ROUTES, SECURITY, agencyInviteSchema, agencyRemoveSchema, agencyWhiteLabelSchema (+15 more)

### Community 23 - "chart.jsx"
Cohesion: 0.29
Nodes (8): ChartContainer, ChartContext, ChartLegendContent, ChartTooltipContent, getPayloadConfigFromPayload(), THEMES, useChart(), recharts

### Community 24 - "carousel.jsx"
Cohesion: 0.33
Nodes (8): Carousel, CarouselContent, CarouselContext, CarouselItem, CarouselNext, CarouselPrevious, useCarousel(), embla-carousel-react

### Community 25 - "drawer.jsx"
Cohesion: 0.22
Nodes (7): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle, vaul

### Community 26 - "toggle-group.jsx"
Cohesion: 0.17
Nodes (12): Alert, AlertDescription, AlertTitle, alertVariants, ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle (+4 more)

### Community 27 - "breadcrumb.jsx"
Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 28 - "app/page.js"
Cohesion: 0.14
Nodes (18): App(), Nav(), Pricing(), checkout(), portal(), AuthModal(), google(), submit() (+10 more)

### Community 29 - "@sentry/nextjs"
Cohesion: 0.33
Nodes (3): onRequestError(), register(), @sentry/nextjs

### Community 30 - "paths"
Cohesion: 0.25
Nodes (7): compilerOptions, baseUrl, paths, exclude, @/app/*, @/components/*, @/lib/*

### Community 31 - "reminderService.js"
Cohesion: 0.18
Nodes (17): cleanSecret(), decrypt(), deriveKey(), encrypt(), getCurrentKey(), getDecryptKeys(), packAndEncrypt(), unpackAndDecrypt() (+9 more)

### Community 32 - "dropdown-menu.jsx"
Cohesion: 0.18
Nodes (10): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+2 more)

### Community 33 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, autoprefixer, cross-env, globals, jsdom, @playwright/test, postcss, tailwindcss (+9 more)

### Community 34 - "resolutions"
Cohesion: 0.29
Nodes (7): resolutions, **/anymatch/picomatch, follow-redirects, form-data, **/micromatch/picomatch, **/readdirp/picomatch, yaml

### Community 35 - "webhookService.js"
Cohesion: 0.48
Nodes (4): createWebhook(), deleteWebhook(), listWebhooks(), truncate()

### Community 36 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, alwaysStrict, esModuleInterop, exactOptionalPropertyTypes, forceConsistentCasingInFileNames, isolatedModules, lib, module (+16 more)

### Community 37 - "Project: DMForge — AI DM setter builder + Stripe-enabled SaaS"
Cohesion: 0.10
Nodes (19): API endpoints (all working), Backend sub-agent log, Critical Issues Requiring Fix, Detailed Findings, Frontend sub-agent log, Key Findings, Notes, Pages (+11 more)

### Community 38 - "logError"
Cohesion: 0.35
Nodes (8): resolveSeats(), log(), logError(), createAgent(), generateAgentScript(), truncate(), sign(), triggerWebhooks()

### Community 39 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, start, test, test:coverage, test:e2e, test:e2e:ui (+2 more)

### Community 40 - "analytics.js"
Cohesion: 0.19
Nodes (11): AnalyticsProvider(), CookieConsent(), choose(), ErrorBoundary, getConsent(), identify(), initAnalytics(), isEnabled() (+3 more)

### Community 41 - "avatar.jsx"
Cohesion: 0.40
Nodes (4): Avatar, AvatarFallback, AvatarImage, @radix-ui/react-avatar

### Community 42 - "ValidationError"
Cohesion: 0.19
Nodes (19): AppError, ForbiddenError, NotFoundError, ValidationError, withErrorHandling(), acceptAgencyInvite(), getAgencyDetails(), inviteAgencyMember() (+11 more)

### Community 43 - "functions/index.js"
Cohesion: 0.16
Nodes (14): Scheduler (SMS reminders), crypto, decrypt(), { defineSecret }, deriveKey(), ENCRYPTION_KEY, ENCRYPTION_KEY_PREVIOUS, { getFirestore, FieldValue } (+6 more)

### Community 47 - "The workflow"
Cohesion: 0.13
Nodes (14): 1. Page + link crawl, 2. API probe, 3. Real authenticated journey, 4. Real-browser pass (when click-driven flows matter), 5. Health scan, 6. Diagnose failures (only what failed), 7. Remediate or hand off, 8. Re-verify until green (+6 more)

### Community 49 - "CI Workflow"
Cohesion: 1.00
Nodes (3): CI Workflow, E2E Workflow, Pre-Deploy Verification Workflow

### Community 51 - "repository"
Cohesion: 0.67
Nodes (3): repository, type, url

### Community 53 - "DMForge"
Cohesion: 0.07
Nodes (27): DMForge Project Rules, DMForge Brand Tokens, Commands, DMForge — Project Rules, graphify, Layout, Rules, Stack (+19 more)

### Community 56 - "tabs.jsx"
Cohesion: 0.40
Nodes (4): TabsContent, TabsList, TabsTrigger, @radix-ui/react-tabs

### Community 60 - "The workflow"
Cohesion: 0.13
Nodes (14): 1. Page + link crawl, 2. API probe, 3. Real authenticated journey, 4. Real-browser pass (when click-driven flows matter), 5. Health scan, 6. Diagnose failures (only what failed), 7. Remediate or hand off, 8. Re-verify until green (+6 more)

### Community 68 - "getBaseUrl"
Cohesion: 0.36
Nodes (7): 2026-09-06 audit — "missing components" pass, fetchSession(), robots(), 2026-09-06 audit — "missing components" pass, saveAndShare(), getBaseUrl(), handleTwilioInbound()

### Community 70 - "Verification Before Completion"
Cohesion: 0.17
Nodes (11): Common Failures, Key Patterns, Overview, Rationalization Prevention, Red Flags - STOP, The Bottom Line, The Gate Function, The Iron Law (+3 more)

### Community 71 - "next"
Cohesion: 0.10
Nodes (8): metadata, metadata, Success(), TABS, Logo(), TrackSubscriptionActive(), config, next

### Community 72 - "main"
Cohesion: 0.20
Nodes (11): main(), Test POST /api/agent/chat - invalid agentId returns 404, Test GET /api/me?email=nonexistent, test_agent_chat_invalid_id(), test_me_not_found(), Assumptions & honesty box, DMForge — Ship-Faster Agent Workflow, Part 2 — The DMForge area → agent map (+3 more)

### Community 73 - "Known gaps log — DMForge frontend"
Cohesion: 0.50
Nodes (3): 2026-09-04 audit, Environment gotchas hit while auditing via the remote-devices bridge, Known gaps log — DMForge frontend

### Community 74 - "Known gaps log — DMForge frontend"
Cohesion: 0.50
Nodes (3): 2026-09-04 audit, Environment gotchas hit while auditing via the remote-devices bridge, Known gaps log — DMForge frontend

### Community 75 - "Shipping DMForge"
Cohesion: 0.20
Nodes (9): Before touching anything: read the drift file, Build, Env vars that gate real features, Post-deploy, Pre-flight checklist, Report format, Shipping DMForge, The real deploy path (+1 more)

### Community 76 - "Shipping DMForge"
Cohesion: 0.20
Nodes (9): Before touching anything: read the drift file, Build, Env vars that gate real features, Post-deploy, Pre-flight checklist, Report format, Shipping DMForge, The real deploy path (+1 more)

### Community 77 - "Reconciled facts — where DMForge's docs drift from reality"
Cohesion: 0.22
Nodes (8): Bridge-only quirks (remote-devices / device_bash), not codebase issues, Build tool, Dependency pins — do not "helpfully" bump these, Deploy trigger, Git index corruption (0-byte index), Node versions, Reconciled facts — where DMForge's docs drift from reality, Scheduler (SMS reminders)

### Community 78 - "auth-context.js"
Cohesion: 0.39
Nodes (6): AuthCtx, auth, db, firebaseConfig, googleProvider, firebase

### Community 79 - "Reconciled facts — where DMForge's docs drift from reality"
Cohesion: 0.25
Nodes (7): Bridge-only quirks (remote-devices / device_bash), not codebase issues, Build tool, Dependency pins — do not "helpfully" bump these, Deploy trigger, Git index corruption (0-byte index), Node versions, Reconciled facts — where DMForge's docs drift from reality

### Community 81 - "Auditing DMForge's frontend"
Cohesion: 0.29
Nodes (6): Auditing DMForge's frontend, Gap categories to check, Report format, Verification, What to fix live vs. flag, Workflow

### Community 82 - "Auditing DMForge's frontend"
Cohesion: 0.29
Nodes (6): Auditing DMForge's frontend, Gap categories to check, Report format, Verification, What to fix live vs. flag, Workflow

### Community 83 - "DMForge E2E — real-browser click tests (Playwright)"
Cohesion: 0.29
Nodes (6): DMForge E2E — real-browser click tests (Playwright), Install (one time, in the DMForge repo root), Note: keep test files out of the deployed bundle, Reuse for future projects, Run, What it covers (tests/e2e/smoke.spec.js)

### Community 84 - "Part 1 — Bright Data onboarding (lead enrichment for DMForge)"
Cohesion: 0.33
Nodes (6): Credentials for DMForge (if enrichment runs in-app), Part 1 — Bright Data onboarding (lead enrichment for DMForge), Setup steps (run on your machine — this is not something I can do for you), Smoke test before scaling, The SDK note (verified against DMForge's package.json), Why Bright Data fits DMForge

### Community 85 - "input-otp.jsx"
Cohesion: 0.33
Nodes (5): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, input-otp

### Community 86 - "Env var checklist — DMForge"
Cohesion: 0.40
Nodes (4): Before telling anyone a channel/integration is "shippable", Env var checklist — DMForge, Feature-gated — fails closed by design, not a bug, Required — nothing works without these

### Community 87 - "Env var checklist — DMForge"
Cohesion: 0.40
Nodes (4): Before telling anyone a channel/integration is "shippable", Env var checklist — DMForge, Feature-gated — fails closed by design, not a bug, Required — nothing works without these

### Community 88 - "solo-business-copilot.md"
Cohesion: 0.50
Nodes (3): Core Philosophy: Anti-AI Slop & Humanisation, Role & Identity, Solo Business Operator Alignment

### Community 89 - "Security Policy"
Cohesion: 0.50
Nodes (3): Reporting a Vulnerability, Scope, Security Policy

## Knowledge Gaps
- **430 isolated node(s):** `Stack`, `Commands`, `Layout`, `Rules`, `graphify` (+425 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 550 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `react`, `best/[slug]/page.js`, `[[...path]]/route.js`, `package.json`, `ValidationError`, `health/route.js`, `app/layout.js`, `app/page.js`?**
  _High betweenness centrality (0.187) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `react`, `dropdown-menu.jsx`, `tabs.jsx`, `sidebar.jsx`, `avatar.jsx`, `utils.js`, `alert-dialog.jsx`, `menubar.jsx`, `form.jsx`, `navigation-menu.jsx`, `input-otp.jsx`, `chart.jsx`, `carousel.jsx`, `drawer.jsx`, `toggle-group.jsx`, `breadcrumb.jsx`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `authFetch()` (e.g. with `Recommendations` and `Test Coverage`) actually correct?**
  _`authFetch()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Stack`, `Commands`, `Layout` to the rest of the system?**
  _430 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.029411764705882353 - nodes in this community are weakly interconnected._
- **Should `best/[slug]/page.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09206349206349207 - nodes in this community are weakly interconnected._