import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Analytics } from "@vercel/analytics/react";
import posthog from "posthog-js";
import { PostHogErrorBoundary, PostHogProvider } from "@posthog/react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

const rawToken = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN;
const isTokenConfigured =
  Boolean(rawToken) &&
  typeof rawToken === "string" &&
  !rawToken.includes("T33gnL7") &&
  rawToken.startsWith("phc_") &&
  rawToken.trim().length > 20;

// Safe no-op client so calls to posthog succeed silently without network calls or errors
const noop = () => {};
const dummyPostHog = {
  __loaded: true,
  config: {},
  capture: noop,
  captureException: noop,
  identify: noop,
  reset: noop,
  register: noop,
  register_once: noop,
  unregister: noop,
  opt_in_capturing: noop,
  opt_out_capturing: noop,
  has_opted_in_capturing: () => false,
  has_opted_out_capturing: () => true,
  isFeatureEnabled: () => false,
  getFeatureFlag: () => undefined,
  getFeatureFlagPayload: () => undefined,
  onFeatureFlags: () => noop,
  reloadFeatureFlags: noop,
};

if (isTokenConfigured) {
  posthog.init(rawToken, {
    api_host:
      import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    defaults: "2026-01-30",
    disable_session_recording: true,
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PostHogProvider client={isTokenConfigured ? posthog : dummyPostHog}>
      <PostHogErrorBoundary>
        <Analytics />
        <BrowserRouter>
          <ConvexProvider client={convex}>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ConvexProvider>
        </BrowserRouter>
      </PostHogErrorBoundary>
    </PostHogProvider>
  </StrictMode>,
);
