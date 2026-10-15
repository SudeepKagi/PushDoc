import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ChevronRight,
  FileText,
  GitPullRequest,
  Lock,
  ArrowRight,
  Unplug,
  Activity,
  ClipboardCheck,
  Cpu,
  RefreshCw,
  Zap,
  Terminal,
  Shield,
  CheckCircle2,
  ChevronDown,
  Github,
  Layers,
  ExternalLink,
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/* ── Modes Mock ────────────────────────────────────────────────────────────── */
const MODES = [
  { id: "direct", label: "Direct Commit", Icon: FileText },
  { id: "pr", label: "Pull Request", Icon: GitPullRequest },
];

/* ── 3 Steps (Matching daemondoc) ──────────────────────────────────────────── */
const STEPS = [
  {
    Icon: Unplug,
    title: "Connect Repo",
    desc: "Link your GitHub repository once",
    iconClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  },
  {
    Icon: Activity,
    title: "Push Code",
    desc: "Just code & commit as usual",
    iconClass: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  },
  {
    Icon: ClipboardCheck,
    title: "README Updates",
    desc: "Docs sync automatically instantly",
    iconClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
];

/* ── FAQs (Matching daemondoc) ─────────────────────────────────────────────── */
const FAQS = [
  {
    q: "How does PushDoc know when I push new code?",
    a: "When you switch on a repository, PushDoc registers a webhook with GitHub. Every git push to your default branch sends an authenticated payload with HMAC-SHA256 signature verification directly to our worker queue.",
  },
  {
    q: "Does PushDoc overwrite manual edits I make to my README?",
    a: "No. PushDoc operates in smart section patch mode by default. It parses your existing markdown sections into an Abstract Syntax Tree (AST) and only touches the specific sections affected by your latest commits.",
  },
  {
    q: "Can I review README changes before they go live?",
    a: "Yes. In your repository settings on the dashboard, you can toggle between 'Direct Commit' (where PushDoc commits straight to main) and 'Pull Request' mode (where PushDoc opens a reviewable PR with line diffs).",
  },
  {
    q: "What happens if Google Gemini hits rate limits?",
    a: "PushDoc implements an automatic circuit breaker with instant fallback to Sarvam AI. If the primary model encounters a 429 quota or latency spike, jobs seamlessly failover without failing your queued run.",
  },
  {
    q: "Is my private repository source code safe?",
    a: "Yes. PushDoc operates under a strict zero-retention policy. Source files are read in volatile memory buffers for static analysis and purged immediately once the documentation is committed.",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState("direct");
  const [activeFaq, setActiveFaq] = useState(null);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* ── Resizable Navbar (Matching daemondoc) ─────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/mascot-bust.png"
              alt="PushDoc Mascot Aura"
              width={34}
              height={34}
              className="h-8 w-auto"
            />
            <span className="font-display text-xl font-bold tracking-tight text-white">
              PushDoc
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="cursor-pointer transition-colors hover:text-white"
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection("platform")}
              className="cursor-pointer transition-colors hover:text-white"
            >
              Platform
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="cursor-pointer transition-colors hover:text-white"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="cursor-pointer transition-colors hover:text-white"
            >
              FAQ
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/SudeepKagi/PushDoc"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:text-white sm:flex"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-500"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section (Matching daemondoc) ─────────────────────────────────── */}
      <main
        id="hero"
        className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28"
      >
        {/* Ambient radial glows */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/2 left-1/4 h-[320px] w-[500px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:gap-3 sm:text-sm">
            <Sparkles size={15} className="shrink-0 text-sky-300" />
            <span className="h-3.5 w-px shrink-0 bg-white/30" />
            <span>
              Synced on every push
              <span className="hidden sm:inline"> — no manual edits</span>
            </span>
            <ChevronRight size={15} className="shrink-0 opacity-70" />
          </div>

          {/* Headline with Mascot Peeking (Matching daemondoc) */}
          <h1 className="font-display mx-auto mt-8 max-w-4xl text-3xl font-medium tracking-tight text-white sm:text-5xl sm:leading-[1.15] lg:text-6xl">
            From git push{" "}
            <span className="inline-block -translate-y-1 align-middle">
              <img
                src="/mascot-bust.png"
                alt="Aura"
                width={56}
                height={56}
                className="animate-doku-bob inline-block h-10 w-auto drop-shadow-[0_4px_12px_rgba(79,70,229,0.4)] sm:h-14"
              />
            </span>{" "}
            to current docs in seconds.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Connect your repository once. Every push to your default branch
            triggers an evidence-backed README update with zero manual
            formatting.
          </p>

          {/* Prompt Mock Card (Matching daemondoc) */}
          <div className="mx-auto mt-10 w-full max-w-2xl rounded-2xl bg-white/15 p-1 shadow-2xl ring-1 ring-white/30 backdrop-blur-md">
            <div className="rounded-xl bg-slate-950/90 p-4 text-left select-none">
              <p className="px-2 pt-2 pb-8 font-mono text-sm text-slate-400 sm:pb-10 sm:text-base">
                github.com/your-org/your-repo
                <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-indigo-400 align-middle" />
              </p>

              <div className="flex flex-col gap-3 border-t border-slate-800/80 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1 rounded-full bg-white/[0.06] p-1">
                  {MODES.map(({ id, label, Icon }) => {
                    const isSelected = selectedMode === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSelectedMode(id)}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          isSelected
                            ? "bg-white/15 text-white"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Icon size={14} />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-500"
                >
                  <span>Connect repo</span>
                  <Sparkles size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Live Browser Mock (Matching daemondoc Live Demo) */}
          <div className="relative mx-auto mt-16 max-w-4xl">
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 shadow-2xl">
              {/* Browser chrome header */}
              <div className="flex items-center gap-4 border-b border-slate-800 bg-slate-900 px-4 py-3">
                <div className="flex shrink-0 gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-slate-950/80 py-1 font-mono text-xs text-slate-400">
                  <Lock size={11} className="text-emerald-400" />
                  <span>push-doc.vercel.app</span>
                </div>
              </div>

              {/* Mock Dashboard Window */}
              <div className="space-y-4 bg-slate-950/60 p-6 text-left font-mono text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
                    <span className="font-semibold text-slate-200">
                      Worker Queue Active
                    </span>
                  </div>
                  <span className="text-slate-400">
                    BullMQ on Redis • Convex Live Logs
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                    <div className="text-slate-400">Last Commit Trigger</div>
                    <div className="truncate font-semibold text-indigo-400">
                      git push origin main (#17ba987)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      HMAC-SHA256 verified
                    </div>
                  </div>
                  <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                    <div className="text-slate-400">Generation Strategy</div>
                    <div className="font-semibold text-emerald-400">
                      Smart Section Patch
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Preserved 4 manual sections
                    </div>
                  </div>
                  <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                    <div className="text-slate-400">AI Provider Chain</div>
                    <div className="font-semibold text-sky-400">
                      Gemini 3.1 Flash Lite
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Sarvam AI standby fallback
                    </div>
                  </div>
                </div>

                <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-950 p-3 text-slate-300">
                  <div className="text-slate-400">
                    // Convex Real-time Live Log Stream
                  </div>
                  <div className="text-emerald-400">
                    [info] Webhook payload accepted for SudeepKagi/PushDoc
                  </div>
                  <div>
                    [info] AST analyzer detected 1 modified route file in
                    src/routes/
                  </div>
                  <div>
                    [info] Synthesizing updated API documentation diff...
                  </div>
                  <div className="text-indigo-400">
                    [success] README committed directly to main (score: 98/100)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Steps Section (Matching daemondoc) ─────────────────────────────────── */}
      <section
        id="how-it-works"
        className="border-t border-slate-800/80 bg-slate-950 py-20"
      >
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              How PushDoc Works
            </h2>
            <p className="text-sm text-slate-400">
              Three simple steps to permanent documentation sync.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((step, idx) => {
              const StepIcon = step.Icon;
              return (
                <div
                  key={idx}
                  className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center transition-colors hover:border-slate-700"
                >
                  <div
                    className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full border ${step.iconClass}`}
                  >
                    <StepIcon size={22} />
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    {idx + 1}. {step.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-400">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Platform Bento Grid (Matching daemondoc Platform Grid) ───────────── */}
      <section
        id="platform"
        className="border-t border-slate-800/80 bg-slate-900/30 py-20"
      >
        <div className="mx-auto max-w-5xl space-y-12 px-6">
          <div className="mx-auto max-w-2xl space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 font-mono text-xs text-indigo-400">
              <Zap className="h-3.5 w-3.5" /> Platform Capabilities
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              One webhook. Docs that write themselves.
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Every feature below runs off the same GitHub push webhook:
              provider fallback, smart generation modes, and live job logs all
              stay in sync automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Model Card */}
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 text-indigo-400">
                <Cpu size={18} />
                <h3 className="text-sm font-semibold text-white">
                  Dual Provider Resilience
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Primary synthesis runs via Gemini 3.1 Flash Lite. If rate limits
                (HTTP 429) or timeouts occur, the pipeline automatically fails
                over to Sarvam AI.
              </p>
              <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]">
                <div className="text-emerald-400">
                  ● Gemini 3.1 Flash Lite (Primary)
                </div>
                <div className="text-slate-400">
                  ○ Sarvam AI (Failover Standby)
                </div>
              </div>
            </div>

            {/* Mode Card */}
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 text-sky-400">
                <RefreshCw size={18} />
                <h3 className="text-sm font-semibold text-white">
                  Smart Generation Modes
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Deterministic AST analyzer inspects incoming commits and selects
                between Full Rewrite (new repos), Section Patch (small code
                diffs), and Cleanup.
              </p>
              <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]">
                <div className="text-slate-300">Mode: Section Patch</div>
                <div className="text-slate-400">AST Nodes Touched: 2/14</div>
              </div>
            </div>

            {/* Ingest Card */}
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 text-emerald-400">
                <Terminal size={18} />
                <h3 className="text-sm font-semibold text-white">
                  Convex Live Logs
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Watch documentation generation live step-by-step. Real-time log
                streaming over Convex WebSockets directly on your dashboard.
              </p>
              <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]">
                <div className="text-indigo-400">
                  Live SSE &amp; Convex WebSocket
                </div>
                <div className="text-slate-400">
                  HMAC-SHA256 signature verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section (Matching daemondoc) ─────────────────────────────────── */}
      <section
        id="faq"
        className="border-t border-slate-800/80 bg-slate-950 py-20"
      >
        <div className="mx-auto max-w-3xl space-y-8 px-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-400">
              Everything you need to know about PushDoc.
            </p>
          </div>

          <div className="divide-y divide-slate-800 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx}>
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="flex w-full cursor-pointer items-center justify-between p-4 text-left text-sm font-medium text-slate-200 transition-colors hover:text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform ${
                        isOpen ? "rotate-180 text-indigo-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs leading-relaxed text-slate-400">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer (Matching daemondoc) ───────────────────────────────────────── */}
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
        <div className="mx-auto max-w-3xl space-y-5 px-6 py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Everything you need to stop writing docs.
          </h2>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-400">
            Connect your GitHub repository in 30 seconds. PushDoc handles README
            updates automatically on every commit.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 text-sm font-medium text-white shadow-md transition-all hover:bg-indigo-500"
          >
            <Github className="h-4 w-4" />
            <span>Connect with GitHub</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="border-t border-slate-800/80">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs sm:flex-row">
            <div className="flex items-center gap-2">
              <img
                src="/mascot-bust.png"
                alt="PushDoc"
                width={24}
                height={24}
                className="h-6 w-auto"
              />
              <span className="font-display font-semibold text-white">
                PushDoc
              </span>
              <span className="text-slate-400">
                © {new Date().getFullYear()}
              </span>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="cursor-pointer transition-colors hover:text-white"
              >
                How it works
              </button>
              <button
                onClick={() => scrollToSection("platform")}
                className="cursor-pointer transition-colors hover:text-white"
              >
                Platform
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="cursor-pointer transition-colors hover:text-white"
              >
                FAQ
              </button>
              <a
                href="https://github.com/SudeepKagi/PushDoc"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
