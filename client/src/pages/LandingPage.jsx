import React from "react";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Integrations from "../components/landing/Integrations";
import HowItWorks from "../components/landing/HowItWorks";
import SecuritySection from "../components/landing/SecuritySection";
import LandingFooter from "../components/landing/LandingFooter";

export default function LandingPage({ handleLoginRedirect, setPage }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Hero handleLoginRedirect={handleLoginRedirect} setPage={setPage} />
            <Features />
            <Integrations />
            <HowItWorks />
            <SecuritySection />
            <LandingFooter handleLoginRedirect={handleLoginRedirect} setPage={setPage} />
        </div>
    );
}
