# DMForge — Design System Rules (for Figma MCP integration)

Companion to [CLAUDE.md](CLAUDE.md) (working rules), [DESIGN.md](DESIGN.md) (why decisions were made),
[.impeccable.md](.impeccable.md) (brand/aesthetic direction), and [dmforge-brand.md](dmforge-brand.md)
(verified brand tokens). This doc exists specifically so a Figma MCP session translates designs into
code that matches what's actually here — not shadcn defaults, not generic Tailwind conventions.

Verified directly against the repo at `D:\Dev\Workspaces\Active\DMForge` on 2026-09-07. Where something
is missing or broken, it's called out as a gap rather than assumed.

## 1. Token definitions

**Where:** [app/globals.css](app/globals.css) `:root`. There is no separate `tokens.json` /
Style Dictionary / theme file — the CSS custom properties *are* the source of truth.

**Format:** shadcn convention — HSL triples **without** the `hsl()` wrapper, consumed as `hsl(var(--*))`:

```css
--background: 240 41% 7%;   /* #0B0B1A */
--primary: 349 100% 65%;    /* #FF4D6D */
--radius: 12px;
```

[tailwind.config.js](tailwind.config.js) maps these into Tailwind's color scale under `theme.extend.colors`
(`primary`, `secondary`, `destructive`, `muted`, `accent`, `popover`, `card`, `chart-1..5`, `sidebar*`, plus
`border`/`input`/`ring`/`background`/`foreground`) and derives `borderRadius.lg/md/sm` from `--radius`.

**Do this when translating Figma tokens:**
- A Figma color style becomes an HSL triple added to `:root` in `globals.css`, then referenced through
  Tailwind's semantic class (`bg-primary`, `text-muted-foreground`) — never a raw hex utility (`bg-[#FF4D6D]`)
  except in the handful of places already doing that deliberately (see `components/logo.jsx`, which hardcodes
  `#FF4D6D`/`#A0A0C8` because it renders before Tailwind's token layer in some contexts).
- [dmforge-brand.md](dmforge-brand.md) has the hex equivalents already reconciled with the HSL values — use
  it to eyeball whether a Figma color matches an existing token before adding a new one.
- **No token transformation pipeline exists.** Don't introduce Style Dictionary, Tokens Studio JSON, or a
  build step for this — it's one hand-maintained CSS file by design (solo-maintained project, per DESIGN.md).
- **Dark-only.** Every token above is a dark-theme value; there are no light-mode equivalents defined anywhere,
  and `darkMode: ["class"]` + a hardcoded `dark` class on `<html>` ([app/layout.js](app/layout.js)) means light
  mode isn't wired up even if you add light tokens. If a Figma file has a light variant, treat it as
  out-of-scope unless the user explicitly asks to ship light mode (per `.impeccable.md`, it's "a possible
  future evolution, not a current requirement").
- **Banned per `.impeccable.md`** (removed in the 2026-07-07 "anti-slop pass," do not reintroduce): gradient
  text/fills, neon glow shadows, decorative radial-gradient backgrounds, evenly-distributed accent colors.
  Featured/elevated surfaces use `.elevate-coral` / `.elevate-purple` (tinted box-shadow utilities in
  `globals.css`), not glow or gradient.

## 2. Component library

**Where:** `components/ui/*.jsx` — shadcn/ui primitives (Radix-based), generated via the shadcn CLI per
[components.json](components.json) (`"style": "new-york"`, `"rsc": true`, `"tsx": false`). ~40 components
already exist (button, card, dialog, sheet, select, tabs, dropdown-menu, form, sidebar, etc. — see
`components/ui/` for the full list). **Check there before generating a new primitive from Figma — most
common UI patterns already exist and should be reused, not regenerated.**

`components/*.jsx` (outside `ui/`) are hand-written, page-level composed components: `auth-modal.jsx`,
`logo.jsx`, `footer.js`, `support-chat.jsx`, `analytics-provider.jsx`, `error-boundary.jsx`,
`track-subscription-active.jsx`. This is where a new Figma screen's bespoke composition goes — compose
from `components/ui/*` primitives, don't duplicate their internals.

**Component architecture** — every `ui/` component follows this exact shape; match it for anything new:

```jsx
// components/ui/button.jsx (representative pattern)
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 ... [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: { default: "bg-primary text-primary-foreground shadow hover:bg-primary/90", ... },
      size: { default: "h-9 px-4 py-2", sm: "h-8 rounded-md px-3 text-xs", ... },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
```

Rules: `React.forwardRef`, variants via `cva`, class merging via `cn()` (never raw template strings for
conditional classes), `displayName` set explicitly, named export of both the component and its `*Variants`
function when one exists.

**No Storybook / component docs site.** `DESIGN.md` and `.impeccable.md` are the documentation layer —
they record *why*, not a visual catalog. Don't propose adding Storybook as part of a Figma integration
task; it's not part of this project's workflow (solo-maintained, per DESIGN.md's stated philosophy).

## 3. Frameworks & libraries

- **Next.js 16 (preview channel, App Router)** + **React 19 (canary)** — see exact pinned versions in
  [package.json](package.json). **Plain JavaScript only — `.js`/`.jsx`, never `.ts`/`.tsx`.** This is an
  explicit, enforced project rule (CLAUDE.md, DESIGN.md's alternatives table): don't emit TypeScript when
  converting a Figma component to code, even if that's shadcn's/Figma's default output mode.
- **Styling:** Tailwind CSS 3.4 (not v4) + `tailwindcss-animate` + `class-variance-authority` (variants) +
  `tailwind-merge` + `clsx` (both wrapped by `lib/utils.js`'s `cn()`).
- **Primitives:** Radix UI (`@radix-ui/react-*`, mostly pinned to `-rc.*` prerelease tags — don't "helpfully"
  bump these to stable without checking, the RC pins are deliberate to track the React 19 canary).
- **Forms:** `react-hook-form` + `zod` + `@hookform/resolvers`.
- **Icons:** `lucide-react` (see §5).
- **Other UI deps actually in use:** `recharts` (charts), `embla-carousel-react` (carousels), `vaul`
  (drawer), `sonner` (toasts), `cmdk` (command palette), `input-otp`, `react-day-picker`.
- **Installed but unused — don't build against these:**
  - `framer-motion` — zero usages found (`grep -rl framer-motion app components` → nothing). If a Figma
    design implies motion, use CSS transitions/keyframes (see `.typing-dot` in `globals.css` for the
    existing pattern) or raise reintroducing framer-motion as an explicit decision, not a silent default.
  - `next-themes` — installed, unused; theme is hardcoded dark (see §1). Flagged as dead weight in the
    2026-09-04 frontend audit.
- **Build:** Next 16 builds with **Turbopack** by default (`turbopack: {}` declared in
  [next.config.js](next.config.js)); the `webpack()` block that exists is dev-only (polling config for a
  low-resource watch setup) and is not the production bundler.
- **Package manager: Yarn 1.x, pinned via `packageManager` in package.json. Never npm/pnpm, never hand-edit
  `yarn.lock`.**

## 4. Asset management

**There is no `public/` directory in this repository**, and no image/SVG/icon files are tracked in git at
all (verified: `git ls-files | grep -iE '\.(svg|png|ico|jpg|jpeg|webp|gif)$'` returns nothing). This is the
biggest gap for Figma asset handoff:

- The visual brand assets *in code* are `app/icon.svg` (the official "Bubble D" mark — the real source of
  truth for the app icon shape) plus the same path inlined in `components/logo.jsx`, and the two rasters
  rendered from it, `app/favicon.ico` and `app/apple-icon.png`. Master artwork lives outside the repo at
  `D:\Business HQ\Brands Logos\DMForge Logo.pdf`.
- [dmforge-brand.md](dmforge-brand.md) documents a set of exported brand files by name (`dmforge-icon-512.png`,
  `dmforge-wordmark-dark.png`, `favicon.ico`, etc.) — **these are not present in the repo.** They're either
  hosted externally or exist only on the user's machine outside version control. Don't assume they're
  importable from a project path; ask where they actually live before wiring up an `<Image>` reference to
  one.
- Icons are wired through Next's `app/` file conventions (`icon.svg`, `favicon.ico`, `apple-icon.png`), not
  a hand-written `metadata.icons` entry — fixed in `dfe10cc` and re-rendered for the Bubble D mark.
- `next.config.js` sets **`images: { unoptimized: true }`** — deliberate (Hobby-plan cost tradeoff per
  DESIGN.md), meaning `next/image` gets zero lazy-loading/optimization benefit here. When bringing in a new
  image from Figma, `next/image` is still fine for markup consistency, but don't expect it to do anything
  `<img>` wouldn't.
- **No CDN configuration** beyond Vercel's own asset serving; `remotePatterns` only allowlists
  `avatars.githubusercontent.com`. Any new external image domain (e.g. a Figma-exported asset hosted
  elsewhere) needs adding there.
- If a Figma-to-code task needs new static assets, create `public/` (it doesn't currently exist) and add
  files there — that's the standard Next.js App Router convention this project would fall back to.

## 5. Icon system

**Library: `lucide-react` exclusively** — confirmed by `components.json`'s `"iconLibrary": "lucide"` and by
usage (27 files import from `'lucide-react'`, zero from any other icon package).

```jsx
import { ArrowLeft, Mail, CheckCircle2, Link2, MessageSquare } from 'lucide-react'
```

- Icons are imported by name directly, never through a wrapper/index component and never as individual SVG
  files — there's no `components/icons/` directory.
- Default sizing comes from Tailwind utilities, not props: `buttonVariants` bakes in
  `[&_svg]:size-4 [&_svg]:shrink-0` for any icon inside a `Button`; elsewhere icons get explicit `className`
  sizing (`w-[18px] h-[18px]`, `h-4 w-4`, etc.) matched to context.
- **No custom SVG icon system and no naming convention beyond Lucide's own PascalCase exports.** When a
  Figma design specifies a custom icon, first check whether a Lucide icon is a close semantic match
  (lucide.dev) before exporting a bespoke SVG — that's the path of least resistance this codebase already
  follows everywhere except the one hand-drawn brand mark in `logo.jsx`.

## 6. Styling approach

**Methodology:** Tailwind CSS utility-first, shadcn "new-york" variant, with three supporting layers:

1. **CSS custom properties** for theme tokens (`app/globals.css` `:root` — see §1).
2. **`cva`** for component-level style variants (see §2).
3. **`cn()`** (`clsx` + `tailwind-merge`, in [lib/utils.js](lib/utils.js)) for merging/conditional class
   names — this is required for any conditional className, not optional style preference:
   ```js
   export function cn(...inputs) { return twMerge(clsx(inputs)); }
   ```

**Global styles** live entirely in `app/globals.css` — no CSS Modules, no styled-components, no
CSS-in-JS anywhere in the codebase. Beyond the Tailwind directives and token block, it hand-defines a small
set of brand utility classes that fall outside Tailwind's generated system:

```css
.font-display { font-family: var(--font-display), ui-sans-serif, system-ui; letter-spacing: -0.02em; }
.elevate-coral { box-shadow: 0 16px 40px -24px rgba(255, 77, 109, 0.45); }
.btn-primary { background: #FF4D6D; color: #0B0B1A; }
.typing-dot { animation: typing-dot 1.4s infinite; }
```

These are the *only* acceptable place for hand-written CSS — new one-off visual treatments from a Figma
design should extend this block, not introduce a new stylesheet or a `<style jsx>` block.

**Fonts:** loaded via `next/font/google` in `app/layout.js` — **Fraunces** (display, weights 500/600/700)
and **IBM Plex Sans** (body, weights 400/500/600), bound to `--font-display`/`--font-body` and applied via
the `.font-display`/`.font-body` utility classes above. (Historical note: DESIGN.md/`.impeccable.md`
mention this replaced an original Space Grotesk + Inter pairing during the anti-slop pass — don't reuse the
old fonts.)

**Responsive design:** stock Tailwind breakpoints, no custom `screens` beyond the `2xl: 1400px` container
cap; the container itself is `center: true` with `padding: 2rem`. No `src/` directory exists despite
`tailwind.config.js`'s `content` glob defensively including `./src/**/*.{js,jsx}` — that's dead/unused
config, not a hint of an alternate structure.

**Dark mode:** `darkMode: ["class"]` is configured, but there is no toggle anywhere — `dark` is a hardcoded
literal class on `<html>` in `app/layout.js`, and no light-token values exist. Don't build a theme switcher
or read `next-themes` (installed but unused, see §3) as if it's wired up.

## 7. Project structure

Next.js App Router, file-based routing. Path aliases from [jsconfig.json](jsconfig.json) — **use these,
not relative `../../` imports**, for anything a Figma-to-code pass generates:

```json
{ "@/*": ["./*"], "@/components/*": ["./components/*"], "@/lib/*": ["./lib/*"], "@/app/*": ["./app/*"] }
```

```
app/                      — routes (App Router); one catch-all API route: app/api/[[...path]]/route.js
  page.js                 — landing page (currently one large 'use client' component — flagged tech debt,
                             see the 2026-09-04 audit note in the project's Claude docs)
  dashboard/, inbox/, settings/{channels,integrations,team,white-label}/, blog/, about/, contact/, legal/, ...
  layout.js, globals.css, providers.js, error.js, global-error.js, not-found.js, robots.js, sitemap.js
components/
  ui/                     — shadcn/ui primitives (~40 components, see §2)
  *.jsx / *.js            — hand-written composed components (logo, footer, auth-modal, support-chat, ...)
lib/                      — server/shared singletons: firebaseAdmin.js, firebase.js, llm.js, stripe.js,
                             ghl.js, encryption.js, rateLimit.js, webhooks.js, mail.js, sms.js, utils.js (cn())
hooks/                    — currently just use-mobile.jsx
tests/e2e/                — Playwright specs
```

Governance docs already at repo root — read these, don't duplicate their content into new Figma-specific
docs: [CLAUDE.md](CLAUDE.md) (stack/commands/rules), [DESIGN.md](DESIGN.md) (why, alternatives considered,
known limitations), [.impeccable.md](.impeccable.md) (brand personality, aesthetic direction, banned
patterns), [dmforge-brand.md](dmforge-brand.md) (verified color/type/logo reference), [components.json](components.json)
(shadcn config — aliases, style, icon library).

## Quick checklist for any Figma → code task here

1. Match colors to existing HSL tokens in `app/globals.css` before adding new ones; check `dmforge-brand.md` first.
2. Check `components/ui/*` for an existing primitive before generating a new one.
3. Icons → find the nearest `lucide-react` icon before exporting custom SVG.
4. New component → `forwardRef` + `cva` + `cn()`, plain `.jsx`, no TypeScript.
5. No light mode, no framer-motion, no next-themes toggle, no gradient text/glow shadows — all dead or banned.
6. No `public/` directory exists yet; if the task needs a real image asset, create it and confirm the source file with the user (see §4's asset gaps) rather than assuming one exists.
7. Confirm actual asset filenames/paths with the user before referencing anything from `dmforge-brand.md`'s file list — those files aren't in the repo.
