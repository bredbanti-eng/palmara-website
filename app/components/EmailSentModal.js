"use client";

import { useLang } from "./LangProvider";

export default function EmailSentModal({ status, email, onDownload, onClose }) {
  const { tr } = useLang();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(43,27,18,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 20,
      }}
      className="fade-in"
    >
      <div
        style={{
          background: "var(--bg)",
          borderRadius: 8,
          padding: 32,
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          border: "1px solid var(--panel-deep)",
        }}
        className="fade-up"
      >
        {status === "sending" && (
          <>
            <div className="loading-row" style={{ justifyContent: "center" }}>
              <span className="spinner" />
              <span>{tr("email_sending")}</span>
            </div>
          </>
        )}

        {status === "sent" && (
          <>
            <div className="check-pop" style={{ margin: "0 auto 14px" }}>✓</div>
            <h2 style={{ marginBottom: 8 }}>{tr("email_sent_title")}</h2>
            <p style={{ color: "var(--ink-soft)" }}>
              {tr("email_sent_body")} <strong>{email}</strong>.
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>
              {tr("email_sent_check_spam")}
            </p>
          </>
        )}

        {status === "failed" && (
          <>
            <h2 style={{ marginBottom: 8 }}>{tr("brand")}</h2>
            <p className="error-text">{tr("email_failed")}</p>
          </>
        )}

        {status !== "sending" && (
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={onDownload}>
              {tr("download_pdf")}
            </button>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "1px solid var(--panel-deep)",
                color: "var(--ink)",
                padding: "16px 24px",
                borderRadius: 4,
                cursor: "pointer",
                fontFamily: "var(--sans)",
                fontWeight: 600,
              }}
            >
              {tr("modal_close")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
