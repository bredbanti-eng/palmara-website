'use client';

import { useState } from 'react';
import PalmUploader from './PalmUploader';
import { LANGUAGES, DEFAULT_LANGUAGE, t } from '../lib/i18n';

// The single source of truth for the chosen language. Everything on the
// page — header, hero, uploader, birth-details form, the reading itself,
// the upsell — reads off this one piece of state, so switching language
// here changes the whole experience, not just the AI-generated text.
export default function HomeClient() {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);

  return (
    <main className="page">
      <header className="site-header">
        <span className="brand">{t(language, 'brandName')}</span>
        <div className="header-actions">
          <a className="contact-link" href="mailto:hello@palmara.in">
            {t(language, 'contactLabel')}
          </a>
          <nav className="lang-toggle" aria-label="Language">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                className={l.code === language ? 'lang-btn active' : 'lang-btn'}
                onClick={() => setLanguage(l.code)}
              >
                {l.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <section className="hero">
        <h1>{t(language, 'heroHeadline')}</h1>
        <p>{t(language, 'heroSubtext')}</p>
        <label htmlFor="palm-photo-input" className="cta-button">
          {t(language, 'ctaPrimary')}
        </label>
      </section>

      <section className="how-it-works">
        <h2>{t(language, 'howItWorksTitle')}</h2>
        <div className="steps">
          <div className="step">
            <span className="step-num">1</span>
            <h3>{t(language, 'step1Title')}</h3>
            <p>{t(language, 'step1Text')}</p>
          </div>
          <div className="step">
            <span className="step-num">2</span>
            <h3>{t(language, 'step2Title')}</h3>
            <p>{t(language, 'step2Text')}</p>
          </div>
          <div className="step">
            <span className="step-num">3</span>
            <h3>{t(language, 'step3Title')}</h3>
            <p>{t(language, 'step3Text')}</p>
          </div>
        </div>
      </section>

      <PalmUploader language={language} />

      <footer className="honesty">
        <p>{t(language, 'honesty')}</p>
      </footer>
    </main>
  );
}
