'use client';

import { useState, useEffect, useRef } from 'react';
import PaymentButton from './PaymentButton';
import UpsellCTA from './UpsellCTA';
import { t } from '../lib/i18n';
import { generateReportPdf, downloadPdf } from '../lib/generateReportPdf';

export default function ReadingResult({ language, reading }) {
  const [full, setFull] = useState(reading.full || null);
  const [pdfStatus, setPdfStatus] = useState('idle'); // idle | generating | ready | error
  const autoDownloaded = useRef(false);
  const paid = Boolean(full);

  const label = reading.handShape
    ? reading.handShape[0].toUpperCase() + reading.handShape.slice(1)
    : '';

  const buildAndDownload = async () => {
    setPdfStatus('generating');
    try {
      const doc = await generateReportPdf({
        brandName: t(language, 'brandName'),
        name: reading.name,
        reportForLabel: t(language, 'reportForLabel'),
        handLabel: label,
        yourHandLabel: t(language, 'yourHandLabel'),
        teaser: reading.teaser,
        fullText: full,
        honesty: t(language, 'honesty'),
      });
      downloadPdf(doc, `${t(language, 'brandName')}-reading.pdf`);
      setPdfStatus('ready');
    } catch (err) {
      console.error('pdf generation failed', err);
      setPdfStatus('error');
    }
  };

  // The moment payment unlocks the full text, hand them their PDF
  // automatically — the button below just lets them get it again.
  useEffect(() => {
    if (paid && !autoDownloaded.current) {
      autoDownloaded.current = true;
      buildAndDownload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paid]);

  return (
    <div className="reading">
      {paid && (
        <div className="report-brand-strip">
          <span className="report-brand">{t(language, 'brandName')}</span>
          {reading.name && (
            <span className="report-for">
              {t(language, 'reportForLabel')} {reading.name}
            </span>
          )}
        </div>
      )}

      <h2>
        {t(language, 'yourHandLabel')} {label}
      </h2>
      <p>{reading.teaser}</p>

      {paid ? (
        <>
          <div className="pdf-ready">
            <p className="pdf-ready-title">{t(language, 'pdfReadyTitle')}</p>
            <p className="pdf-ready-text">{t(language, 'pdfReadyText')}</p>
            <button className="pay-button" onClick={buildAndDownload} disabled={pdfStatus === 'generating'}>
              {pdfStatus === 'generating' ? t(language, 'generatingPdf') : t(language, 'downloadPdfButton')}
            </button>
            {pdfStatus === 'error' && <p className="error">{t(language, 'pdfError')}</p>}
          </div>
          <UpsellCTA language={language} reportId={reading.id} defaultName={reading.name} />
        </>
      ) : (
        <div className="locked">
          <p className="locked-hint">{t(language, 'lockedHint')}</p>
          <PaymentButton language={language} reportId={reading.id} onUnlocked={(fullText) => setFull(fullText)} />
        </div>
      )}
    </div>
  );
}
