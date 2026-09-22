"use client";

import { useRef, useState } from "react";
import BirthDetailsForm from "./BirthDetailsForm";
import PaymentButton from "./PaymentButton";
import UpsellCTA from "./UpsellCTA";
import EmailSentModal from "./EmailSentModal";
import ScanningPreview from "./ScanningPreview";
import { classifyHandShape, seedFromLandmarks } from "@/lib/handClassifier";
import { generateReportPdf, generateReportPdfBase64 } from "@/lib/generateReportPdf";
import { useLang } from "./LangProvider";

export default function PalmUploader() {
  const { lang, tr } = useLang();
  const [status, setStatus] = useState("idle");
  // idle -> detecting -> awaiting-details -> generating -> result
  const [errorMsg, setErrorMsg] = useState("");
  const [handShape, setHandShape] = useState(null);
  const [seed, setSeed] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [teaser, setTeaser] = useState("");
  const [fullText, setFullText] = useState("");
  const [reportId, setReportId] = useState(null);
  const [paid, setPaid] = useState(false);
  const [emailModalStatus, setEmailModalStatus] = useState(null); // null | sending | sent | failed
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setStatus("detecting");
    setErrorMsg("");
    const scanStartedAt = Date.now();
    const MIN_SCAN_MS = 1800;

    async function waitForMinimumScanTime() {
      const elapsed = Date.now() - scanStartedAt;
      if (elapsed < MIN_SCAN_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_SCAN_MS - elapsed));
      }
    }

    try {
      const imageBitmap = await createImageBitmap(file);
      const canvas = canvasRef.current;
      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(imageBitmap, 0, 0);

      const { HandLandmarker, FilesetResolver } = await import(
        "@mediapipe/tasks-vision"
      );
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        },
        runningMode: "IMAGE",
        numHands: 1,
      });

      const result = handLandmarker.detect(canvas);
      if (!result.landmarks || result.landmarks.length === 0) {
        await waitForMinimumScanTime();
        URL.revokeObjectURL(objectUrl);
        setStatus("error");
        setErrorMsg(tr("detect_error"));
        return;
      }

      const landmarks = result.landmarks[0];
      setHandShape(classifyHandShape(landmarks));
      setSeed(seedFromLandmarks(landmarks));
      await waitForMinimumScanTime();
      URL.revokeObjectURL(objectUrl);
      setStatus("awaiting-details");
    } catch (err) {
      console.error(err);
      await waitForMinimumScanTime();
      URL.revokeObjectURL(objectUrl);
      setStatus("error");
      setErrorMsg(tr("detect_error"));
    }
  }

  async function handleDetailsSubmit(details) {
    setStatus("generating");
    setName(details.name);
    setEmail(details.email);
    try {
      const res = await fetch("/api/generate-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handShape,
          seed,
          language: lang,
          ...details,
        }),
      });
      const data = await res.json();
      setTeaser(data.teaserText);
      setFullText(data.fullText);
      setReportId(data.reportId);
      setStatus("result");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg(tr("detect_error"));
    }
  }

  async function getEnglishTextForPdf() {
    if (lang !== "hi") return fullText;
    const res = await fetch("/api/translate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId }),
    });
    const data = await res.json();
    return data.englishText || fullText;
  }

  async function handleDownloadPdf() {
    setIsDownloading(true);
    const englishText = await getEnglishTextForPdf();
    generateReportPdf({
      brand: "Palmara",
      tagline: "Vedic Palm Readings",
      name,
      reportText: englishText,
      lang: "en",
    });
    setIsDownloading(false);
  }

  async function handlePaymentSuccess() {
    setPaid(true);
    setEmailModalStatus("sending");

    const englishText = await getEnglishTextForPdf();
    const pdfBase64 = generateReportPdfBase64({
      brand: "Palmara",
      tagline: "Vedic Palm Readings",
      name,
      reportText: englishText,
      lang: "en",
    });

    try {
      const res = await fetch("/api/send-report-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email, name, lang, reportId, pdfBase64 }),
      });
      const result = await res.json();
      setEmailModalStatus(result.sent ? "sent" : "failed");
    } catch (err) {
      console.error(err);
      setEmailModalStatus("failed");
    }
  }

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {status === "idle" && (
        <div className="upload-box fade-in">
          <p style={{ marginBottom: 16 }}>{tr("upload_box_label")}</p>
          <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginBottom: 16 }}>
            {tr("upload_hint")}
          </p>
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} />
        </div>
      )}

      {status === "detecting" && (
        <div className="fade-in">
          <ScanningPreview imageUrl={previewUrl} />
          <div className="loading-row" style={{ justifyContent: "center" }}>
            <span className="spinner" />
            <span>{tr("detecting")}</span>
          </div>
        </div>
      )}

      {status === "awaiting-details" && (
        <div className="fade-up">
          <BirthDetailsForm onSubmit={handleDetailsSubmit} />
        </div>
      )}

      {status === "generating" && (
        <div className="loading-row fade-in">
          <span className="spinner" />
          <span>{tr("generating")}</span>
        </div>
      )}

      {status === "error" && <p className="error-text fade-in">{errorMsg}</p>}

      {status === "result" && (
        <div className="fade-up">
          <h3>{tr("teaser_heading")}</h3>
          <div className="report-box fade-up">{teaser}</div>

          {!paid && (
            <div className="fade-up stagger-1" style={{ textAlign: "center", margin: "24px 0" }}>
              <p>
                <span style={{ textDecoration: "line-through", color: "var(--ink-soft)" }}>
                  {tr("unlock_price_was")}
                </span>{" "}
                <strong style={{ fontSize: "1.3rem", color: "var(--maroon)" }}>
                  {tr("unlock_price_now")}
                </strong>
              </p>
              <PaymentButton
                reportId={reportId}
                name={name}
                onPaid={handlePaymentSuccess}
              />
              <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>{tr("unlock_note")}</p>
            </div>
          )}

          {paid && (
            <div className="fade-up">
              <div style={{ display: "flex", alignItems: "center", margin: "18px 0" }}>
                <span className="check-pop">✓</span>
                <span style={{ color: "var(--green)", fontWeight: 600 }}>
                  {lang === "hi" ? "अनलॉक हो गया" : "Unlocked"}
                </span>
              </div>
              <div className="report-box fade-up">{fullText}</div>
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <button className="btn-primary" onClick={handleDownloadPdf} disabled={isDownloading}>
                  {isDownloading ? tr("preparing_pdf") : tr("download_pdf_again")}
                </button>
              </div>
              <div className="fade-up stagger-2">
                <UpsellCTA reportId={reportId} />
              </div>
            </div>
          )}
        </div>
      )}

      {emailModalStatus && (
        <EmailSentModal
          status={emailModalStatus}
          email={email}
          onDownload={handleDownloadPdf}
          onClose={() => setEmailModalStatus(null)}
        />
      )}
    </div>
  );
}
