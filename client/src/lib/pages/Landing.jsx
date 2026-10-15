import React, { useState, useId } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "framer-motion";
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
  Brain as BrainIcon,
  Folder as FolderIcon,
  SquareMousePointer,
  CheckCircle2,
  RefreshCw,
  SkipForward,
  Network,
  GitBranch,
  Menu,
  X,
} from "lucide-react";
import { CandyLink, CandyButton } from "@/components/ui/candy-button";
import { cn } from "@/lib/utils";

/* ── Constants ─────────────────────────────────────────────────────────────── */
const RESIZE_TRANSITION = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
};

const SURFACE =
  "bg-white/95 shadow-[0_1px_0_rgba(0,0,0,0.04),0_4px_20px_rgba(34,42,53,0.10)]";

const SECTION_X = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
const SECTION_Y = "py-24 sm:py-32";
const SECTION_HEAD_GAP = "mb-16";

const NAV_LINKS = [
  { name: "How it works", link: "#how-it-works" },
  { name: "Features", link: "#features" },
];

const MODES = [
  { id: "direct", label: "Direct", Icon: FileText },
  { id: "pr", label: "Pull Request", Icon: GitPullRequest },
];

const STEPS = [
  {
    Icon: Unplug,
    title: "Connect Repo",
    desc: "Link your GitHub repository once",
    iconClass: "bg-indigo-50 text-indigo-600 border-indigo-200",
  },
  {
    Icon: Activity,
    title: "Push Code",
    desc: "Just code & commit as usual",
    iconClass: "bg-indigo-50 text-indigo-600 border-indigo-200",
  },
  {
    Icon: ClipboardCheck,
    title: "README Updates",
    desc: "Docs sync automatically instantly",
    iconClass: "bg-amber-50 text-amber-600 border-amber-200",
  },
];

const RUN_STATUS_STYLES = {
  success: {
    label: "Success",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    icon: <CheckCircle2 size={14} />,
  },
  ongoing: {
    label: "In Progress",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-100",
    icon: <RefreshCw size={14} className="animate-spin" />,
  },
  skipped: {
    label: "Skipped",
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-100",
    icon: <SkipForward size={14} />,
  },
};

const RUNS = [
  {
    action: "Full README Rewrite",
    repo: "pushdoc/server",
    time: "2m ago",
    status: "success",
  },
  {
    action: "Targeted Section Patch",
    repo: "pushdoc/client",
    time: "12m ago",
    status: "success",
  },
  {
    action: "README Cleanup",
    repo: "pushdoc/docs",
    time: "28m ago",
    status: "ongoing",
  },
  {
    action: "Full README Rewrite",
    repo: "pushdoc/convex-server",
    time: "1h ago",
    status: "skipped",
  },
];

const FAQ_QUESTIONS = [
  {
    question: "How does PushDoc keep my README up to date?",
    answer:
      "Connect a repository once, then keep working as usual. PushDoc listens for GitHub pushes, reviews the changed code, and updates the relevant README sections when your documentation needs to change.",
  },
  {
    question: "Will it rewrite my whole README every time?",
    answer:
      "No. PushDoc is designed to update the sections affected by your changes, so the rest of your README stays intact instead of being replaced by a fresh generic document.",
  },
  {
    question: "Does PushDoc support monorepos?",
    answer:
      "Yes. You can connect monorepos and let PushDoc work with the documentation structure already used by your projects.",
  },
  {
    question: "What access does PushDoc need?",
    answer:
      "PushDoc uses scoped GitHub OAuth access to connect the repositories you choose. Access tokens are encrypted, and the service is built to keep secrets and internal configuration out of generated documentation.",
  },
  {
    question: "Can I review documentation changes before publishing?",
    answer:
      "Yes. Documentation updates can be created as Pull Requests, giving your existing repository workflow a clear place to review what changed before merging.",
  },
  {
    question: "How much does PushDoc cost?",
    answer:
      "PushDoc is currently available to get started with at no cost. Connect a repository and see how continuous documentation fits into your workflow.",
  },
];

/* ── SVG Animation Components ─────────────────────────────────────────────── */
function LineSvg({ className, delay = 0, color = "#F17463" }) {
  const glowId = useId();
  return (
    <svg
      width="312"
      height="33"
      viewBox="0 0 312 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("absolute top-2 right-4 overflow-visible", className)}
    >
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M0.5 1 H311.5 V32"
        stroke="#e5e5e5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M0.5 1 H311.5 V32"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="24 366"
        filter={`url(#${glowId})`}
        style={{
          animation: `line-pulse-travel-corner 2.6s linear ${delay}s infinite`,
        }}
      />
    </svg>
  );
}

function StraightLine({ className, delay = 0, color = "#f59e0b" }) {
  const glowId = useId();
  return (
    <svg
      width="312"
      height="2"
      viewBox="0 0 312 2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("absolute overflow-visible", className)}
    >
      <defs>
        <filter
          id={glowId}
          filterUnits="userSpaceOnUse"
          x="-10"
          y="-10"
          width="332"
          height="22"
        >
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M0.5 1 H311.5"
        stroke="#e5e5e5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M0.5 1 H311.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="24 335"
        filter={`url(#${glowId})`}
        style={{
          animation: `line-pulse-travel-straight 2.6s linear ${delay}s infinite`,
        }}
      />
    </svg>
  );
}

function PulseBorderIcon({ className }) {
  const glowId = useId();
  return (
    <div className={cn("absolute size-12", className)}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        className="absolute inset-0 overflow-visible"
      >
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect
          x="0.5"
          y="0.5"
          width="47"
          height="47"
          rx="2"
          stroke="#e5e5e5"
          strokeWidth="1"
          fill="none"
        />
        <rect
          x="0.5"
          y="0.5"
          width="47"
          height="47"
          rx="2"
          stroke="#4f46e5"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="16 176.6"
          filter={`url(#${glowId})`}
          style={{
            animation: "border-ring-pulse 3s linear infinite",
          }}
        />
        <rect
          x="0.5"
          y="0.5"
          width="47"
          height="47"
          rx="2"
          stroke="#f59e0b"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="16 176.6"
          filter={`url(#${glowId})`}
          style={{
            animation: "border-ring-pulse 3s linear infinite",
            animationDelay: "-1.5s",
          }}
        />
      </svg>
      <div className="absolute inset-px flex items-center justify-center rounded-[2px] bg-white">
        <img
          src="/mascot-bust.png"
          width={36}
          height={36}
          alt="PushDoc"
          className="h-8 w-auto"
        />
      </div>
    </div>
  );
}

/* ── Main Landing Component ────────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  // Scroll tracking for Navbar & Hero curvature
  const { scrollY } = useScroll();
  const [navVisible, setNavVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState("direct");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const next = latest > 100;
    setNavVisible((prev) => (prev === next ? prev : next));
  });

  const radius = useTransform(scrollY, [0, 260], [0, 32]);
  const inset = useTransform(scrollY, [0, 260], [0, 14]);
  const frameStyle = reduceMotion
    ? undefined
    : {
        borderBottomLeftRadius: radius,
        borderBottomRightRadius: radius,
        marginLeft: inset,
        marginRight: inset,
      };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased selection:bg-[#4F46E5] selection:text-white">
      {/* ── Resizable Navbar ────────────────────────────────────────────────────── */}
      <motion.nav
        aria-label="Main"
        className="fixed inset-x-0 top-6 z-50 w-full"
      >
        {/* Desktop Navbar */}
        <motion.div
          animate={{
            width: navVisible ? "65%" : "100%",
            y: navVisible ? 8 : 0,
          }}
          transition={RESIZE_TRANSITION}
          style={{ minWidth: "720px", contain: "layout" }}
          className={cn(
            "relative z-[60] mx-auto hidden max-w-7xl flex-row items-center justify-between rounded-full px-6 py-2.5 transition-colors duration-300 lg:flex",
            navVisible
              ? SURFACE
              : "bg-transparent [&_.nav-link]:text-white [&_.nav-wordmark]:text-white",
          )}
        >
          {/* Logo */}
          <Link
            to="/"
            aria-label="PushDoc home"
            className="flex items-center gap-2.5"
          >
            <img
              src="/mascot-bust.png"
              alt="PushDoc Mascot"
              width={34}
              height={34}
              className="h-8 w-auto drop-shadow-sm md:h-9"
            />
            <span
              className={cn(
                "nav-wordmark font-display text-xl font-bold tracking-tight transition-colors",
                navVisible ? "text-slate-900" : "text-white",
              )}
            >
              PushDoc
            </span>
          </Link>

          {/* Nav Links (Testimonials removed!) */}
          <div className="absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-6 text-sm font-medium lg:flex">
            {NAV_LINKS.map((item) => (
              <a
                key={item.name}
                href={item.link}
                className={cn(
                  "nav-link transition-colors hover:opacity-100",
                  navVisible
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-white/90 hover:text-white",
                )}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="relative z-20 flex items-center">
            <CandyLink
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
              className="px-6 py-2.5 text-sm"
            >
              Get Started
            </CandyLink>
          </div>
        </motion.div>

        {/* Mobile Navbar */}
        <motion.div
          animate={{
            width: navVisible ? "92%" : "100%",
            y: navVisible ? 4 : 0,
          }}
          transition={RESIZE_TRANSITION}
          className={cn(
            "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between rounded-2xl px-4 py-2.5 transition-colors duration-300 lg:hidden",
            navVisible ? SURFACE : "bg-transparent text-white",
          )}
        >
          <div className="flex w-full flex-row items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/mascot-bust.png"
                alt="PushDoc"
                width={30}
                height={30}
                className="h-7 w-auto"
              />
              <span
                className={cn(
                  "font-display text-lg font-bold",
                  navVisible ? "text-slate-900" : "text-white",
                )}
              >
                PushDoc
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              className={cn(
                "cursor-pointer rounded-lg p-2 transition-colors",
                navVisible ? "text-slate-700" : "text-white",
              )}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex w-full flex-col gap-2 rounded-xl bg-white p-4 text-slate-900 shadow-xl"
              >
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.name}
                    href={link.link}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {link.name}
                  </a>
                ))}
                <CandyLink
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileOpen(false);
                    navigate("/login");
                  }}
                  className="mt-2 w-full text-center"
                >
                  Get Started
                </CandyLink>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.nav>

      {/* ── Hero Section ────────────────────────────────────────────────────────── */}
      <main id="hero">
        <motion.section
          style={frameStyle}
          className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden pt-40 pb-40 lg:pt-48 lg:pb-52"
        >
          {/* Full-bleed Painted Fantasy Background */}
          <img
            src="/background4.png"
            alt="PushDoc landscape"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover object-center [filter:saturate(1.45)_contrast(1.14)_brightness(1.06)]"
          />

          {/* Ambient Scrims */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_45%_at_50%_30%,rgba(3,17,48,0.30)_0%,rgba(3,17,48,0.10)_55%,transparent_80%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b from-slate-950/35 via-slate-950/10 to-transparent" />

          <div className={cn("relative text-center", SECTION_X)}>
            {/* Eyebrow Pill */}
            <div>
              <a
                href="#features"
                className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/25 bg-white/15 py-2 pr-2.5 pl-3 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-white/25 sm:gap-3 sm:pr-3 sm:pl-4 sm:text-sm"
              >
                <Sparkles size={15} className="shrink-0 text-sky-200" />
                <span className="h-4 w-px shrink-0 bg-white/30" />
                <span className="truncate">
                  Synced on every push
                  <span className="hidden sm:inline"> — no manual edits</span>
                </span>
                <ChevronRight size={15} className="shrink-0 opacity-70" />
              </a>
            </div>

            {/* Headline with Mascot Peek Animation */}
            <h1 className="font-display mx-auto mt-10 max-w-3xl text-[1.75rem] leading-[1.16] font-normal tracking-[-0.022em] text-white [text-shadow:0_1px_2px_rgba(3,17,48,0.7),0_3px_18px_rgba(3,17,48,0.55)] sm:mt-12 sm:text-5xl lg:text-[4rem]">
              From git push{" "}
              <span
                aria-hidden="true"
                className="inline-block -translate-y-[0.06em] align-middle [clip-path:inset(-100%_-100%_0_-100%)]"
              >
                <img
                  src="/mascot-bust.png"
                  alt="Aura"
                  width={64}
                  height={64}
                  className="animate-mascot-peek block h-[1em] w-auto drop-shadow-[0_3px_10px_rgba(3,17,48,0.5)]"
                />
              </span>{" "}
              to current docs in seconds.
            </h1>

            {/* Prompt Card */}
            <div className="mx-auto mt-14 w-full max-w-2xl rounded-[22px] bg-white/25 p-1 shadow-[0_32px_72px_-32px_rgba(15,23,42,0.4)] ring-1 ring-white/40 backdrop-blur-md">
              <div className="rounded-[18px] bg-slate-950/90 p-4 text-left select-none">
                <p
                  aria-hidden="true"
                  className="px-2 pt-2 pb-10 font-mono text-sm text-slate-400 sm:pb-12 sm:text-lg"
                >
                  github.com/your-org/your-repo
                  <span className="ml-1 inline-block h-[1.1em] w-[2px] translate-y-[0.18em] animate-pulse bg-slate-400/80 align-baseline" />
                </p>

                <div className="flex flex-col gap-3 border-t border-slate-800/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <div
                    aria-hidden="true"
                    className="flex items-center justify-center gap-1 rounded-full bg-white/[0.06] p-1"
                  >
                    {MODES.map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSelectedMode(id)}
                        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors sm:flex-none sm:px-4 ${
                          selectedMode === id
                            ? "bg-white/15 text-white"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Icon size={15} className="hidden shrink-0 sm:block" />
                        {label}
                      </button>
                    ))}
                  </div>

                  <CandyLink
                    href="/login"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/login");
                    }}
                    className="w-full gap-2 px-6 py-2.5 text-base sm:w-auto"
                  >
                    Connect repo
                    <Sparkles size={16} className="shrink-0" />
                  </CandyLink>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Browser Mock Window (Interactive Demo) ──────────────────────────────── */}
        <section className={cn("relative pt-20 lg:pt-28", SECTION_X)}>
          <div className="relative mx-auto max-w-5xl">
            <div className="animate-pulse-slow absolute -inset-1 top-0 right-0 left-0 rounded-2xl bg-gradient-to-r from-[#4F46E5] via-[#818CF8] to-[#F59E0B] opacity-25 blur-lg" />

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              {/* Browser chrome header */}
              <div className="flex items-center gap-4 border-b border-slate-200 bg-slate-100 px-4 py-3">
                <div className="flex shrink-0 gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-white py-1 pr-16 font-mono text-xs text-slate-500 shadow-xs">
                  <Lock size={11} className="text-emerald-500" />
                  <span>push-doc.vercel.app</span>
                </div>
              </div>

              {/* Demo Content */}
              <div className="space-y-5 bg-slate-900 p-8 text-left font-mono text-xs text-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400" />
                    <span className="font-semibold text-slate-100">
                      Live Worker Status
                    </span>
                  </div>
                  <span className="text-slate-400">
                    BullMQ on Redis • Convex Live Logs
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 font-sans md:grid-cols-3">
                  <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                    <div className="text-xs text-slate-400">Last Trigger</div>
                    <div className="truncate font-mono text-xs font-semibold text-indigo-400">
                      git push origin main (#42e15f0)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      HMAC-SHA256 authenticated
                    </div>
                  </div>
                  <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                    <div className="text-xs text-slate-400">
                      Detection Strategy
                    </div>
                    <div className="text-xs font-semibold text-emerald-400">
                      Section Patch Mode
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Preserved 5 manual sections
                    </div>
                  </div>
                  <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                    <div className="text-xs text-slate-400">
                      Model Orchestrator
                    </div>
                    <div className="text-xs font-semibold text-sky-400">
                      Gemini 3.1 Flash Lite
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Sarvam AI standby fallback
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-300">
                  <div className="text-slate-400">
                    // Convex WebSocket Event Stream
                  </div>
                  <div className="text-emerald-400">
                    [info] Webhook payload accepted for SudeepKagi/PushDoc
                  </div>
                  <div>
                    [info] AST analyzer detected 1 modified route file in
                    client/src/lib/pages/
                  </div>
                  <div>[info] Synthesizing updated documentation diff...</div>
                  <div className="text-indigo-400">
                    [success] README committed directly to main (validation:
                    98/100)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Steps Section ───────────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        aria-labelledby="hero-steps"
        className={cn(SECTION_X, SECTION_Y)}
      >
        <h2 id="hero-steps" className="sr-only">
          How PushDoc works
        </h2>
        <div className="relative mx-auto grid max-w-4xl grid-cols-1 gap-10 text-center md:grid-cols-3">
          {STEPS.map((step, i) => {
            const StepIcon = step.Icon;
            return (
              <div
                key={i}
                className="group relative z-10 border-neutral-200 bg-white p-4"
              >
                <div className="pointer-events-none absolute top-0 -left-4 w-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>
                <div className="pointer-events-none absolute -top-4 left-0 h-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>
                <div className="pointer-events-none absolute -top-4 right-0 h-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>
                <div className="pointer-events-none absolute bottom-0 -left-4 w-[calc(100%+2rem)] border border-dashed border-neutral-200"></div>

                <div
                  className={cn(
                    "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm transition-shadow group-hover:shadow-md",
                    step.iconClass,
                  )}
                >
                  <StepIcon size={24} />
                </div>
                <h3 className="font-display font-bold text-slate-900">
                  {i + 1}. {step.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Platform Bento Grid ─────────────────────────────────────────────────── */}
      <section id="features" className={SECTION_Y}>
        <div
          className={cn(
            "flex flex-col items-center gap-5 px-4 text-center",
            SECTION_HEAD_GAP,
          )}
        >
          <div className="text-sm font-semibold tracking-wide text-indigo-600">
            Platform
          </div>
          <div className="text-2xl font-medium tracking-tighter text-slate-900 sm:text-3xl md:text-4xl">
            One webhook. Docs that write themselves.
          </div>
          <div className="max-w-2xl text-sm text-slate-600 sm:text-base">
            Every feature below runs off the same GitHub push webhook: provider
            fallback, smart generation modes, and live job logs all stay in sync
            automatically.
          </div>
        </div>

        <div className={SECTION_X}>
          <div className="mb-4 grid min-w-full grid-cols-1 gap-4 divide-neutral-200 rounded-2xl bg-white sm:gap-0 sm:divide-x sm:divide-y sm:border sm:border-neutral-200 lg:grid-cols-2">
            {/* Card 1: ModelCard */}
            <div className="h-110 w-full overflow-hidden rounded-2xl border border-neutral-200 p-5 sm:rounded-none sm:border-0 sm:p-6">
              <div className="text-md flex items-center gap-2 font-semibold text-slate-900">
                <BrainIcon className="size-4 text-indigo-600" />
                Provider Priority &amp; Fallback
              </div>
              <div className="pt-2 text-sm leading-relaxed font-normal text-slate-500">
                Gemini runs first with automatic key rotation across multiple
                API keys. If it's rate-limited or down, Sarvam AI steps in so
                your README run never stalls.
              </div>
              <div className="mx-auto min-h-[73%] w-[calc(100%-10px)] pt-5">
                <div className="relative mx-auto mt-12 h-64 max-w-lg">
                  <div className="relative h-full rounded-t-2xl border border-neutral-200 bg-white p-3 shadow-[0_10px_60px_rgba(0,0,0,0.06)]">
                    <div className="flex gap-2 p-2">
                      <div className="size-2.5 rounded-full bg-red-400"></div>
                      <div className="size-2.5 rounded-full bg-yellow-400"></div>
                      <div className="size-2.5 rounded-full bg-emerald-400"></div>
                    </div>

                    <div className="flex items-center gap-2 pt-6 pl-2">
                      <FolderIcon className="size-4 text-slate-500" />
                      <p className="text-sm font-medium text-neutral-700">
                        Provider Priority
                      </p>
                      <div className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                        3 keys
                      </div>
                    </div>

                    <hr className="mt-2 text-neutral-200" />

                    <div className="flex flex-col gap-2 pt-3">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="#4285F4"
                          >
                            <path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" />
                          </svg>
                          <span>Gemini</span>
                        </div>
                        <div className="rounded-md border border-emerald-400 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                          Available
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <img
                            src="/sarvam.svg"
                            height={16}
                            width={16}
                            alt="Sarvam"
                            className="h-4 w-4"
                          />
                          <span>Sarvam</span>
                        </div>
                        <div className="rounded-md border border-amber-400 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                          Fallback
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <img
                            src="/groq.svg"
                            height={16}
                            width={16}
                            alt="Groq"
                            className="h-4 w-4 rounded-xs"
                          />
                          <span>Groq</span>
                        </div>
                        <div className="rounded-md border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">
                          Upcoming
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -top-6 -right-4 w-36 rounded-md border border-neutral-200 bg-white p-2.5 shadow-md">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800">
                        Gemini
                      </span>
                      <span className="font-mono text-slate-400">Key #2</span>
                    </div>
                    <div className="mt-1.5">
                      <span className="rounded-xs border border-indigo-400 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: ChatCard */}
            <div className="h-110 w-full overflow-hidden rounded-2xl border border-neutral-200 p-5 sm:rounded-none sm:border-0 sm:p-6">
              <div className="text-md flex items-center gap-2 font-semibold text-slate-900">
                <SquareMousePointer className="size-4 text-indigo-600" />
                Watch Every Push, Live
              </div>
              <div className="pt-2 text-sm leading-relaxed font-normal text-slate-500">
                Every push streams live job status straight to your dashboard
                over Convex: no polling, no refreshing, just the run as it
                happens.
              </div>
              <div className="mx-auto min-h-[73%] w-[calc(100%-10px)] pt-5">
                <div className="relative mx-auto mt-6 flex h-64 w-full max-w-md flex-col gap-2 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_88%,transparent)]">
                  <div className="flex flex-col gap-2">
                    {RUNS.map((run, index) => {
                      const style = RUN_STATUS_STYLES[run.status];
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-2.5 shadow-xs"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div
                              className={`flex size-7 shrink-0 items-center justify-center rounded-md border ${style.bg} ${style.border} ${style.color}`}
                            >
                              {style.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-[12px] font-medium text-neutral-800">
                                {run.action}
                              </p>
                              <p className="truncate font-mono text-[10px] text-neutral-400">
                                {run.repo} {run.time}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${style.bg} ${style.border} ${style.color}`}
                          >
                            {style.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-auto flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-xs">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                    </span>
                    <p className="text-[12px] text-neutral-500">
                      Waiting for next commit
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: IngestCard (Spans 2 columns on lg) */}
            <div className="h-auto w-full overflow-hidden rounded-2xl border border-neutral-200 p-5 sm:h-110 sm:rounded-none sm:border-0 sm:p-6 lg:col-span-2">
              <div className="text-md flex items-center gap-2 font-semibold text-slate-900">
                <GitBranch className="size-4 text-indigo-600" />
                One Webhook, Smart Generation
              </div>
              <div className="pt-2 text-sm leading-relaxed font-normal text-slate-500">
                A push webhook decides the mode: full rewrite, targeted section
                patch, or a background cleanup pass all run through the same
                BullMQ pipeline.
              </div>
              <div className="mx-auto min-h-[73%] w-[calc(100%-10px)] pt-5">
                <div className="flex flex-col gap-3 px-1 py-6 sm:hidden">
                  <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 shadow-xs">
                    <FileText size={16} className="text-indigo-600" />
                    <span className="text-sm">Full Rewrite</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 shadow-xs">
                    <GitPullRequest size={16} className="text-amber-500" />
                    <span className="text-sm">Section Patch</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 shadow-xs">
                    <Network size={16} className="text-indigo-400" />
                    <span className="text-sm">Cleanup Worker</span>
                  </div>
                </div>

                <div className="relative mx-auto hidden h-full max-w-2xl pt-4 sm:block sm:scale-110">
                  <LineSvg className="top-16 left-32" color="#4f46e5" />
                  <StraightLine className="top-28 left-32" color="#f59e0b" />
                  <LineSvg
                    className="top-34 left-32 rotate-x-180"
                    color="#818cf8"
                  />

                  <div className="absolute top-14 left-4 flex items-center gap-2 text-xs font-medium text-slate-700">
                    <FileText size={15} className="text-indigo-600" />
                    Full Rewrite
                  </div>
                  <div className="absolute top-26 left-4 flex items-center gap-2 text-xs font-medium text-slate-700">
                    <GitPullRequest size={15} className="text-amber-500" />
                    Section Patch
                  </div>
                  <div className="absolute top-38 left-4 flex items-center gap-2 text-xs font-medium text-slate-700">
                    <Network size={15} className="text-indigo-400" />
                    Cleanup Worker
                  </div>

                  <PulseBorderIcon className="top-22 left-[68%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ─────────────────────────────────────────────────────────── */}
      <section
        id="faq"
        aria-labelledby="faq-heading"
        className={cn(SECTION_X, SECTION_Y)}
      >
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16 xl:gap-24">
          <div className="lg:col-span-5">
            <p className="mb-3 text-sm font-semibold tracking-wide text-indigo-600">
              Questions, answered
            </p>
            <h2
              id="faq-heading"
              className="font-display max-w-md text-3xl font-bold text-slate-900 sm:text-4xl"
            >
              Everything you need to know before you connect.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
              A quick look at how PushDoc fits into your GitHub workflow.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="border-t border-slate-200">
              {FAQ_QUESTIONS.map((item, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={item.question}
                    className="border-b border-slate-200"
                  >
                    <h3>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left text-base font-medium text-slate-800 transition-colors hover:text-slate-950 sm:text-lg"
                      >
                        <span>{item.question}</span>
                        <span
                          aria-hidden="true"
                          className="relative flex size-6 shrink-0 items-center justify-center text-indigo-600"
                        >
                          <span className="absolute h-px w-4 bg-current" />
                          <motion.span
                            className="absolute h-4 w-px bg-current"
                            animate={{ rotate: isOpen ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        </span>
                      </button>
                    </h3>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-2xl pr-10 pb-6 text-sm leading-relaxed text-slate-600 sm:text-base">
                            {item.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────────── */}
      <footer className="relative border-t border-slate-100 bg-gradient-to-b from-white via-slate-50/50 to-white pt-14 pb-12 lg:pt-20">
        <div className={SECTION_X}>
          <div className="grid grid-cols-1 gap-12 pb-14 md:grid-cols-12 lg:gap-16">
            <div className="flex flex-col gap-4 md:col-span-8">
              <div className="flex items-end gap-3 self-start">
                <img
                  src="/mascot-full.png"
                  alt="PushDoc Mascot"
                  width={64}
                  height={64}
                  className="h-16 w-auto"
                />
                <span className="font-display pb-1 text-2xl font-bold tracking-tight text-slate-900">
                  PushDoc
                </span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed font-normal text-slate-600">
                The automation layer for your codebase documentation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 md:col-span-4">
              <div>
                <h4 className="mb-4 text-xs font-semibold tracking-wider text-slate-900 uppercase">
                  Product
                </h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a
                      href="#how-it-works"
                      className="text-slate-600 transition-colors hover:text-indigo-600"
                    >
                      How it works
                    </a>
                  </li>
                  <li>
                    <a
                      href="#features"
                      className="text-slate-600 transition-colors hover:text-indigo-600"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#faq"
                      className="text-slate-600 transition-colors hover:text-indigo-600"
                    >
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-xs font-semibold tracking-wider text-slate-900 uppercase">
                  Legal
                </h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <span className="text-slate-400">Privacy Policy</span>
                  </li>
                  <li>
                    <span className="text-slate-400">Terms of Service</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 text-xs text-slate-500 md:flex-row">
            <div>
              © {new Date().getFullYear()} PushDoc Inc. All rights reserved.
            </div>

            <div className="flex items-center gap-6">
              <a
                href="https://github.com/SudeepKagi/PushDoc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 transition-colors hover:text-slate-900"
                aria-label="GitHub"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
