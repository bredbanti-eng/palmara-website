"use client";

import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import { useLang } from "./components/LangProvider";

export default function LandingPage() {
  const { tr } = useLang();

  return (
    <>
      <SiteHeader />
      <main className="wrap" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <h1 className="fade-up" style={{ fontSize: "2.2rem", lineHeight: 1.25, maxWidth: "18ch" }}>
          {tr("landing_headline")}
        </h1>
        <p className="fade-up stagger-1" style={{ color: "var(--ink-soft)", fontSize: "1.1rem", maxWidth: "60ch" }}>
          {tr("landing_sub")}
        </p>
        <div className="fade-up stagger-2">
          <Link href="/get-reading" className="btn-primary">
            {tr("landing_cta")}
          </Link>
        </div>

        <h2 style={{ marginTop: 56 }}>{tr("how_it_works")}</h2>
        <div className="steps">
          <div className="step-card fade-up stagger-1">
            <span className="step-num">1</span>
            <h3 style={{ fontSize: "1.1rem" }}>{tr("step1_title")}</h3>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem" }}>
              {tr("step1_body")}
            </p>
          </div>
          <div className="step-card fade-up stagger-2">
            <span className="step-num">2</span>
            <h3 style={{ fontSize: "1.1rem" }}>{tr("step2_title")}</h3>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem" }}>
              {tr("step2_body")}
            </p>
          </div>
          <div className="step-card fade-up stagger-3">
            <span className="step-num">3</span>
            <h3 style={{ fontSize: "1.1rem" }}>{tr("step3_title")}</h3>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem" }}>
              {tr("step3_body")}
            </p>
          </div>
        </div>

        <div className="honesty-note">{tr("honesty_note")}</div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link href="/get-reading" className="btn-primary">
            {tr("landing_cta")}
          </Link>
        </div>
      </main>
      <footer className="wrap">
        <span>© 2026 {tr("brand")}</span>
        <a href="mailto:hello@palmara.in">{tr("nav_contact")}</a>
      </footer>
    </>
  );
}
