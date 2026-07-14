import React from "react";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import LandingFooter from "../components/landing/LandingFooter";

export default function LandingPage({ handleLoginRedirect, setPage }) {
    return (
        <div style={{ background: "#ffffff", color: "#0f172a", minHeight: "100vh" }}>
            <Hero handleLoginRedirect={handleLoginRedirect} setPage={setPage} />
            <Features />
            <HowItWorks />
            <LandingFooter handleLoginRedirect={handleLoginRedirect} setPage={setPage} />
        </div>
    );
}
