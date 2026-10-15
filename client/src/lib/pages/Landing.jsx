import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Github,
  Zap,
  GitCommit,
  GitPullRequest,
  RefreshCw,
  Cpu,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
  ChevronRight,
  FileCode,
  Terminal,
} from "lucide-react";
import { useAuth } from "../../context/auth-context";

const PIPELINE_STEPS = [
  {
    step: "01",
    title: "Push",
    desc: "You commit code and push to your default branch as usual.",
    cmd: "git push origin main",
  },
  {
    step: "02",
    title: "Webhook",
    desc: "GitHub fires an HMAC-verified webhook directly to BullMQ queue.",
    cmd: "POST /api/github/webhookhandler",
  },
  {
    step: "03",
    title: "Code Scan",
    desc: "Worker analyzes changed files and current README structure.",
    cmd: "Scan git diff & file snapshots",
  },
  {
    step: "04",
    title: "AI Synthesis",
    desc: "Gemini or Sarvam AI writes fresh docs or patches sections.",
    cmd: "Gemini 2.5 + Sarvam AI Fallback",
  },
  {
    step: "05",
    title: "Commit or PR",
    desc: "Pushes updated README back with [skip ci] to prevent loops.",
    cmd: "chore: auto-update README",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Zero Manual Maintenance",
    desc: "Stop letting READMEs drift behind your code. Every commit automatically updates architecture diagrams, setup guides, and APIs.",
  },
  {
    icon: Cpu,
    title: "Multi-Model Fallback",
    desc: "Powered by Gemini first with Sarvam AI fallback. Automatic rate-limit rotation ensures generation never stalls.",
  },
  {
    icon: Clock,
    title: "Live Convex Log Streaming",
    desc: "Watch your README generate step-by-step in real-time. Live logs stream directly from Convex without polling.",
  },
  {
    icon: GitPullRequest,
    title: "Direct Commit or Pull Request",
    desc: "You choose how changes arrive: commit directly to main or open a clean pull request for human review first.",
  },
  {
    icon: Shield,
    title: "Enterprise Loop-Guard",
    desc: "PushDoc commits include [skip ci] markers and SHA verification so automated commits never trigger infinite loops.",
  },
  {
    icon: RefreshCw,
    title: "One-Click Cleanup",
    desc: "Have a messy or outdated README? Click the broom icon on any repo card to format and tidy it on demand.",
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10rem] left-1/2 h-[38rem] w-[54rem] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute top-[30rem] right-[-10rem] h-[28rem] w-[36rem] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/mascot-bust.png"
              alt="PushDoc"
              width={36}
              height={36}
              className="h-8 w-auto"
            />
            <span className="font-display text-lg font-bold tracking-tight text-white">
              PushDoc
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
            <a
              href="#how-it-works"
              className="transition-colors hover:text-white"
            >
              How it works
            </a>
            <a href="#features" className="transition-colors hover:text-white">
              Features
            </a>
            <a href="#pipeline" className="transition-colors hover:text-white">
              Pipeline
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/home"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/25 transition-all hover:bg-blue-500"
              >
                Go to Dashboard
                <ArrowRight size={15} />
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
              >
                <Github size={16} />
                Sign in with GitHub
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300"
        >
          <Sparkles size={14} className="text-blue-400" />
          <span>Next-Generation Automated Documentation</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-tight"
        >
          Your README stays in sync on every{" "}
          <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            git push.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl"
        >
          Connect a GitHub repository once. PushDoc reads your commits, detects
          architectural changes, and automatically commits fresh, accurate
          documentation back to your repository.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to={user ? "/home" : "/login"}
            className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-7 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] hover:bg-blue-500"
          >
            <Github size={18} />
            {user ? "Open Dashboard" : "Connect with GitHub"}
            <ArrowRight size={16} />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-6 text-base font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            See how it works
          </a>
        </motion.div>

        {/* Mascot + Demo Showcase Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative mx-auto mt-16 max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >
          <div className="flex flex-col items-center justify-between gap-8 text-left md:flex-row">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Live Automated Sync
              </div>
              <h3 className="text-2xl font-bold text-white">
                Meet Aura: Your Automated Docs Companion
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Aura listens to your webhook events in real-time, selects
                between full architectural rewrites or targeted section patches,
                and streams live progress step-by-step to your dashboard.
              </p>
              <div className="flex flex-wrap gap-2 pt-2 font-mono text-xs text-slate-400">
                <span className="rounded border border-slate-700/50 bg-slate-800/80 px-2.5 py-1">
                  AST Patching
                </span>
                <span className="rounded border border-slate-700/50 bg-slate-800/80 px-2.5 py-1">
                  HMAC SHA-256
                </span>
                <span className="rounded border border-slate-700/50 bg-slate-800/80 px-2.5 py-1">
                  BullMQ Queue
                </span>
              </div>
            </div>
            <div className="relative flex shrink-0 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl" />
              <img
                src="/mascot-full.png"
                alt="Aura Mascot"
                width={260}
                height={260}
                className="relative h-48 w-auto drop-shadow-2xl select-none sm:h-56"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Pipeline Section */}
      <section
        id="pipeline"
        className="border-t border-slate-900 bg-slate-950/60 py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <span className="font-mono text-xs font-bold tracking-widest text-blue-400 uppercase">
              Deterministic Workflow
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
              How a push becomes documentation
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              From git push to committed markdown in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {PIPELINE_STEPS.map((stage) => (
              <div
                key={stage.step}
                className="relative rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 transition-colors hover:border-slate-700"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-400">
                    {stage.step}
                  </span>
                  <Terminal size={14} className="text-slate-500" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-white">
                  {stage.title}
                </h3>
                <p className="mb-4 text-xs leading-relaxed text-slate-400">
                  {stage.desc}
                </p>
                <div className="truncate rounded border border-slate-800 bg-slate-950 px-2 py-1 font-mono text-[10px] text-slate-400">
                  {stage.cmd}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="border-t border-slate-900 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <span className="font-mono text-xs font-bold tracking-widest text-blue-400 uppercase">
              Engine Capabilities
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
              Engineered for developer confidence
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-6 transition-all hover:border-blue-500/30 hover:bg-slate-900/50"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-600/10 text-blue-400">
                    <Icon size={20} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {feat.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-900 bg-gradient-to-b from-slate-950 to-blue-950/20 py-24 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold text-white sm:text-5xl">
            Never write a boring README by hand again.
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Turn on PushDoc for your repositories today and keep documentation
            effortless and always accurate.
          </p>
          <div className="mt-8">
            <Link
              to={user ? "/home" : "/login"}
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-8 text-base font-semibold text-white shadow-xl shadow-blue-600/25 transition-all hover:scale-[1.02] hover:bg-blue-500"
            >
              <Github size={18} />
              {user ? "Open Dashboard" : "Get Started with GitHub"}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <span>
            © PushDoc. Automated documentation generated from your commits.
          </span>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-slate-300">
              Sign In
            </Link>
            <a
              href="https://github.com/SudeepKagi/PushDoc"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
