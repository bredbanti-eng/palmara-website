"use client";

import { useState } from "react";
import { useLang } from "./LangProvider";

export default function UpsellCTA({ reportId }) {
  const { tr } = useLang();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, name, contact, interest: "mahadasha" }),
    });
    setSent(true);
  }

  if (sent) {
    return <p style={{ color: "var(--ink-soft)" }}>{tr("upsell_thanks")}</p>;
  }

  return (
    <div className="step-card" style={{ marginTop: 32 }}>
      <h3>{tr("upsell_heading")}</h3>
      <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem" }}>{tr("upsell_body")}</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder={tr("upsell_name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ flex: 1, minWidth: 140, padding: 10, borderRadius: 4, border: "1px solid var(--panel-deep)" }}
        />
        <input
          type="text"
          placeholder={tr("upsell_contact")}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
          style={{ flex: 1, minWidth: 140, padding: 10, borderRadius: 4, border: "1px solid var(--panel-deep)" }}
        />
        <button type="submit" className="btn-primary">
          {tr("upsell_submit")}
        </button>
      </form>
    </div>
  );
}
