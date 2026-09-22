"use client";

import { useEffect, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import { useLang } from "../../components/LangProvider";
import { generateReportPdf } from "@/lib/generateReportPdf";

export default function ReportPage({ params }) {
  const { tr } = useLang();
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetch(`/api/report/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => {
        setReport(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [params.id]);

  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    let englishText = report.full_text;
    if (report.language === "hi") {
      const res = await fetch("/api/translate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: params.id }),
      });
      const data = await res.json();
      englishText = data.englishText || report.full_text;
    }
    generateReportPdf({
      brand: "Palmara",
      tagline: "Vedic Palm Readings",
      name: report.name,
      reportText: englishText,
      lang: "en",
    });
    setDownloading(false);
  }

  return (
    <>
      <SiteHeader />
      <main className="wrap" style={{ paddingTop: 40, paddingBottom: 60 }}>
        {status === "loading" && (
          <div className="loading-row">
            <span className="spinner" />
          </div>
        )}
        {status === "error" && <p className="error-text">Report not found.</p>}
        {status === "ready" && (
          <div className="fade-up">
            <h1>{report.name}</h1>
            {report.paid ? (
              <>
                <div className="report-box">{report.full_text}</div>
                <div style={{ textAlign: "center", margin: "24px 0" }}>
                  <button className="btn-primary" onClick={handleDownload} disabled={downloading}>
                    {downloading ? tr("preparing_pdf") : tr("download_pdf_again")}
                  </button>
                </div>
              </>
            ) : (
              <div className="report-box">{report.teaser_text}</div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
