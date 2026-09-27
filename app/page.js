"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowRight,
  MessageCircle,
  Calendar,
  Check,
  Zap,
  Share2,
  Shield,
  Globe,
  Bot,
  ChevronRight,
  Star,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useAuth, authFetch } from "@/lib/auth-context";
import { AuthModal } from "@/components/auth-modal";
import { Logo } from "@/components/logo";
import { track } from "@/lib/analytics";
import { Wizard, ChatSimulator } from "@/components/home";

/* Logo is now imported from @/components/logo */

function Nav({ onTry, onAuthOpen }) {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0B1A]/70 border-b border-[#2A2A55]/40">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm text-[#A0A0C8]">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#pricing" className="hover:text-white">
            Pricing
          </a>
          <Link href="/vs/setsmart" className="hover:text-white">
            vs SetSmart
          </Link>
          <Link href="/blog" className="hover:text-white">
            Playbooks
          </Link>
          <a href="#faq" className="hover:text-white">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm text-[#A0A0C8] hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#1F1F42]"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <button
                onClick={logout}
                title="Sign out"
                aria-label="Sign out"
                className="text-[#A0A0C8] hover:text-white p-2 rounded-lg hover:bg-[#1F1F42]"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Button
              onClick={onAuthOpen}
              variant="outline"
              className="bg-transparent border-[#2A2A55] hover:bg-[#1F1F42] text-sm"
            >
              Sign in
            </Button>
          )}
          <Button
            onClick={onTry}
            className="btn-primary border-0 font-semibold"
          >
            Try it free <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function FeaturesGrid() {
  const featured = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Live test simulator",
      body: "Chat with your AI before you connect anything. Tweak the prompt in plain English until it sells like you — this is the whole reason coaches trust it enough to go live.",
      tone: "coral",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Open prompt",
      body: "See the full prompt your AI uses. Edit any line, any time. Every other setter on the market is a black box — this one isn’t.",
      tone: "purple",
    },
  ];
  const rest = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "60-second setup",
      body: "No platform approval required to start. Build and test in under a minute.",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Multi-channel outreach",
      body: "LinkedIn, email, and SMS ready on day one — more channels shipping soon.",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "In-chat booking",
      body: "GoHighLevel booking — real slots offered and confirmed inside the conversation.",
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: "Viral share links",
      body: "Every transcript gets a branded /r/[id] page to show off what it booked.",
    },
    {
      icon: <Bot className="w-5 h-5" />,
      title: "Plain-English tuning",
      body: 'Say "be more direct" or "ask about budget on turn 3." It rewrites itself.',
    },
  ];
  return (
    <section id="features" className="max-w-7xl mx-auto px-5 py-24">
      <div className="mb-14 max-w-2xl">
        <p className="text-[#FF4D6D] text-sm font-semibold uppercase tracking-widest mb-3">
          Features
        </p>
        <h2 className="font-display text-4xl md:text-5xl font-bold">
          Everything a $99/mo setter does.{" "}
          <span className="text-[#FF4D6D]">Plus the parts they got wrong.</span>
        </h2>
      </div>
      <div className="grid lg:grid-cols-2 gap-5 mb-12">
        {featured.map((f, i) => (
          <Card
            key={i}
            className={`p-8 ${f.tone === "coral" ? "bg-[#FF4D6D]/[0.07] border-[#FF4D6D]/40 elevate-coral" : "bg-[#6B5BFF]/[0.07] border-[#6B5BFF]/40 elevate-purple"}`}
          >
            <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center mb-5 ${f.tone === "coral" ? "bg-[#FF4D6D] text-[#0B0B1A]" : "bg-[#6B5BFF] text-white"}`}
            >
              {f.icon}
            </div>
            <h3 className="font-display font-bold text-xl mb-2">{f.title}</h3>
            <p className="text-[#A0A0C8] leading-relaxed">{f.body}</p>
          </Card>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-7 border-t border-[#2A2A55] pt-10">
        {rest.map((f, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1F1F42] text-[#A0A0C8] flex items-center justify-center shrink-0">
              {f.icon}
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">{f.title}</h4>
              <p className="text-sm text-[#A0A0C8]">{f.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhyBetter() {
  const rows = [
    [
      "Live test before connecting",
      "Yes — in 60 seconds",
      "No — only after Meta connection",
    ],
    [
      "Free forever tier",
      "Yes — no card required",
      "7-day trial, card required",
    ],
    ["Pricing model", "Flat $39/mo, all-in", "$99/mo + per-message"],
    ["Channels", "LinkedIn, SMS, Email", "IG, WhatsApp, Messenger"],
    [
      "Open prompt editing",
      "Full visibility, line-by-line",
      "Black-box prompt",
    ],
    ["Public share links", "Every result has /r/[id]", "No"],
    ["Setup time", "Under 60 seconds", "15-30 minutes"],
  ];
  return (
    <section id="why" className="max-w-6xl mx-auto px-5 py-24">
      <div className="text-center mb-12">
        <p className="text-[#FF4D6D] text-sm font-semibold uppercase tracking-widest mb-3">
          Why DMForge
        </p>
        <h2 className="font-display text-4xl md:text-5xl font-bold">
          DMForge <span className="text-[#FF4D6D]">vs SetSmart</span>
        </h2>
        <p className="text-[#A0A0C8] mt-3">
          An honest, point-by-point comparison.
        </p>
      </div>
      <Card className="bg-[#161630] border-[#2A2A55] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1F1F42]">
            <tr>
              <th className="text-left p-4"></th>
              <th className="text-left p-4 text-[#FF4D6D]">DMForge</th>
              <th className="text-left p-4 text-[#A0A0C8]">SetSmart</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-[#2A2A55]">
                <td className="p-4 font-medium">{r[0]}</td>
                <td className="p-4 text-[#34D399]">{r[1]}</td>
                <td className="p-4 text-[#A0A0C8]">{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="text-center mt-6">
        <Link href="/vs/setsmart" className="text-[#FF4D6D] hover:underline">
          Read the full DMForge vs SetSmart breakdown →
        </Link>
      </p>
    </section>
  );
}

function Pricing({ onTry }) {
  const { user, getToken } = useAuth();
  const [busy, setBusy] = useState(null);
  const [authPrompt, setAuthPrompt] = useState(false);
  async function checkout(planKey) {
    track("upgrade_clicked", { planKey });
    if (!user) {
      setAuthPrompt(true);
      return;
    }
    setBusy(planKey);
    try {
      const res = await authFetch(
        "/api/billing/checkout",
        { method: "POST", body: JSON.stringify({ planKey }) },
        getToken,
      );
      const data = await res.json();
      if (data.url) {
        track("checkout_started", { planKey });
        window.location.href = data.url;
      } else toast.error(data.error || "Checkout failed");
    } catch (e) {
      toast.error("Network error");
    } finally {
      setBusy(null);
    }
  }
  async function portal() {
    if (!user) {
      setAuthPrompt(true);
      return;
    }
    try {
      const res = await authFetch(
        "/api/billing/portal",
        { method: "POST", body: JSON.stringify({}) },
        getToken,
      );
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error(data.error || "No active subscription found");
    } catch {
      toast.error("Network error — try again");
    }
  }
  return (
    <>
      <AuthModal
        open={authPrompt}
        onClose={() => setAuthPrompt(false)}
        defaultMode="signup"
      />
      <section id="pricing" className="max-w-6xl mx-auto px-5 py-24">
        <div className="text-center mb-12">
          <p className="text-[#FF4D6D] text-sm font-semibold uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Flat pricing.{" "}
            <span className="text-[#FF4D6D]">Zero surprises.</span>
          </h2>
          <p className="text-[#A0A0C8] mt-3">
            No per-message charges, ever. Cancel any time.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <Card className="bg-[#161630] border-[#2A2A55] p-7">
            <h3 className="font-display text-2xl font-bold">Free</h3>
            <p className="text-[#A0A0C8] mb-5">For trying it out properly.</p>
            <div className="text-4xl font-display font-bold mb-1">$0</div>
            <div className="text-[#A0A0C8] mb-6">forever • no card</div>
            <Button
              onClick={onTry}
              className="w-full bg-[#1F1F42] hover:bg-[#2A2A55] border-0"
            >
              Start free
            </Button>
            <ul className="mt-6 space-y-2 text-sm text-[#A0A0C8]">
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-[#34D399] mt-0.5" />1 AI setter
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-[#34D399] mt-0.5" />
                Unlimited live simulator
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-[#34D399] mt-0.5" />
                50 real conversations / mo
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-[#34D399] mt-0.5" />
                Public share links
              </li>
            </ul>
          </Card>
          <Card className="bg-[#FF4D6D]/[0.08] border-[#FF4D6D] p-7 relative elevate-coral">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF4D6D] text-[#0B0B1A] border-0">
              Most popular
            </Badge>
            <h3 className="font-display text-2xl font-bold">Pro</h3>
            <p className="text-[#A0A0C8] mb-5">For coaches running real ads.</p>
            <div className="text-4xl font-display font-bold mb-1">
              $39
              <span className="text-base text-[#A0A0C8] font-normal">/mo</span>
            </div>
            <div className="text-[#A0A0C8] mb-6">or $390/yr (save $78)</div>
            <Button
              onClick={() => checkout("pro_monthly")}
              disabled={busy === "pro_monthly"}
              className="btn-primary border-0 w-full font-semibold"
            >
              {busy === "pro_monthly" ? "Loading…" : "Get Pro monthly"}
            </Button>
            <Button
              onClick={() => checkout("pro_annual")}
              disabled={busy === "pro_annual"}
              variant="outline"
              className="bg-transparent border-[#FF4D6D]/50 hover:bg-[#FF4D6D]/10 w-full font-semibold mt-2"
            >
              {busy === "pro_annual" ? "Loading…" : "Pay annually — save $78"}
            </Button>
            <ul className="mt-6 space-y-2 text-sm">
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-[#34D399] mt-0.5" />
                Unlimited AI setters
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-[#34D399] mt-0.5" />
                5,000 real conversations / mo
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-[#34D399] mt-0.5" />
                LinkedIn + SMS + email channels
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-[#34D399] mt-0.5" />
                GHL booking
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-[#34D399] mt-0.5" />
                REST API + webhooks + MCP
              </li>
            </ul>
          </Card>
          <Card className="bg-[#161630] border-[#2A2A55] p-7">
            <h3 className="font-display text-2xl font-bold">Agency</h3>
            <p className="text-[#A0A0C8] mb-5">For running it for clients.</p>
            <div className="text-4xl font-display font-bold mb-1">
              $199
              <span className="text-base text-[#A0A0C8] font-normal">/mo</span>
            </div>
            <div className="text-[#A0A0C8] mb-6">10 client workspaces</div>
            <Button
              onClick={() => checkout("agency")}
              disabled={busy === "agency"}
              className="w-full bg-[#1F1F42] hover:bg-[#2A2A55] border-0"
            >
              {busy === "agency" ? "Loading…" : "Get Agency"}
            </Button>
            <ul className="mt-6 space-y-2 text-sm text-[#A0A0C8]">
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-[#34D399] mt-0.5" />
                10 full client workspaces
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-[#34D399] mt-0.5" />
                Whitelabel + custom domain
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-[#34D399] mt-0.5" />
                Impersonate any client
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-[#34D399] mt-0.5" />
                Bring your own keys (BYOK)
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-[#34D399] mt-0.5" />
                Priority onboarding
              </li>
            </ul>
          </Card>
        </div>
        <p className="text-center mt-6 text-xs text-[#A0A0C8]">
          No commitment • Cancel any time • 30-day money-back guarantee •{" "}
          <button onClick={portal} className="underline hover:text-white">
            Manage existing subscription →
          </button>
        </p>
      </section>
    </>
  );
}

function Faq() {
  const faqs = [
    [
      "Do I really not need a credit card?",
      "Right. Free forever tier, no card. You can build an agent, run unlimited simulations and post up to 50 real conversations per month without paying us a cent.",
    ],
    [
      "How is this different from SetSmart, ManyChat, Chatfuel?",
      "Most are flow-builders or charge per-message. We're AI-native with flat pricing and you can live-test the agent before connecting any account.",
    ],
    [
      "Which channels can I connect?",
      "LinkedIn DMs, email (Gmail or any SMTP inbox), and SMS via Twilio. GoHighLevel webhook sync is already live. More channels are in the pipeline.",
    ],
    [
      "Can I take over a conversation?",
      "Yes — one-tap pause, jump in, and the AI hands the thread to you. Resume the AI whenever.",
    ],
    [
      "Which AI powers the agent?",
      "Gemini 2.5 Flash by default — the fastest, cheapest, capable model. Pro accounts can switch to Claude or GPT in one click.",
    ],
    [
      "Can I cancel any time?",
      'One click in the billing portal. No emails, no "are you sure?" loops.',
    ],
  ];
  return (
    <section id="faq" className="max-w-3xl mx-auto px-5 py-24">
      <div className="text-center mb-10">
        <h2 className="font-display text-4xl md:text-5xl font-bold">
          Frequently asked
        </h2>
      </div>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <details
            key={i}
            className="bg-[#161630] border border-[#2A2A55] rounded-xl p-5 group"
          >
            <summary className="font-semibold cursor-pointer flex justify-between items-center">
              {f[0]}
              <ChevronRight className="w-4 h-4 group-open:rotate-90 transition" />
            </summary>
            <p className="mt-3 text-[#A0A0C8] text-sm">{f[1]}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function App() {
  const [agent, setAgent] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const heroRef = useRef(null);
  useEffect(() => {
    track("landing_viewed");
  }, []);
  const scrollToBuilder = () => {
    heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <Nav onTry={scrollToBuilder} onAuthOpen={() => setAuthOpen(true)} />

      {/* HERO */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1F1F42] border border-[#2A2A55] text-xs text-[#A0A0C8] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />{" "}
              500+ coaches built their setter this week
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.03] tracking-tight">
              Build, test &amp; ship an{" "}
              <span className="text-[#FF4D6D]">AI DM setter</span> in 60
              seconds.
            </h1>
            <p className="text-lg text-[#A0A0C8] mt-6 max-w-xl">
              Qualifies your leads and books your calls — over LinkedIn, email,
              and SMS.{" "}
              <span className="text-white">Test it live right here</span> before
              you connect anything. No card required.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <div className="flex items-center gap-2 text-sm text-[#A0A0C8]">
                <Check className="w-4 h-4 text-[#34D399]" /> Free forever tier
              </div>
              <div className="flex items-center gap-2 text-sm text-[#A0A0C8]">
                <Check className="w-4 h-4 text-[#34D399]" /> Flat pricing
              </div>
              <div className="flex items-center gap-2 text-sm text-[#A0A0C8]">
                <Check className="w-4 h-4 text-[#34D399]" /> LinkedIn, SMS &amp;
                email
              </div>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["F", "S", "A", "M", "T"].map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#0B0B1A] bg-[#FF4D6D] text-[#0B0B1A] flex items-center justify-center text-xs font-bold"
                  >
                    {c}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
                <Star className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
                <Star className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
                <Star className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
                <Star className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
                <span className="ml-2 text-[#A0A0C8]">
                  4.9 • first 500 coaches
                </span>
              </div>
            </div>
          </div>

          {/* Right column: wizard or simulator */}
          <div>
            {!agent ? (
              <Wizard onCreated={setAgent} />
            ) : (
              <ChatSimulator agent={agent} onSave={() => {}} />
            )}
            {agent && (
              <div className="text-center mt-4">
                <button
                  onClick={() => setAgent(null)}
                  className="text-sm text-[#A0A0C8] hover:text-white"
                >
                  ↻ Build a different agent
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="border-y border-[#2A2A55]/60 py-6">
        <div className="max-w-7xl mx-auto px-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[#A0A0C8] text-sm">
          <span>Used by coaches who run on:</span>
          <span className="font-semibold text-white">LinkedIn</span>
          <span className="font-semibold text-white">GoHighLevel</span>
          <span className="font-semibold text-white">Twilio SMS</span>
          <span className="font-semibold text-white">Zapier</span>
        </div>
      </section>

      <FeaturesGrid />
      <WhyBetter />
      <Pricing onTry={scrollToBuilder} />
      <Faq />

      {/* Final CTA */}
      <section className="max-w-5xl mx-auto px-5 py-24 text-center">
        <Card className="bg-[#FF4D6D]/10 border-[#FF4D6D]/40 p-12 elevate-coral">
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Stop losing leads at 11pm.
          </h2>
          <p className="text-[#A0A0C8] mt-3 max-w-xl mx-auto">
            Forge your AI setter in the next 60 seconds. Live-test it right now.
            No credit card, no Meta hoops.
          </p>
          <Button
            onClick={scrollToBuilder}
            className="btn-primary border-0 mt-6 font-semibold px-8 h-12"
          >
            Build my AI setter <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </section>
    </div>
  );
}

export default App;
