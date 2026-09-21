'use client';

import { useState } from 'react';
import { t } from '../lib/i18n';

export default function UpsellCTA({ language, reportId, defaultName }) {
  const [name, setName] = useState(defaultName || '');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contact.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, name, contact: contact.trim(), interest: 'mahadasha' }),
      });
      if (!res.ok) throw new Error('lead failed');
      setStatus('sent');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="upsell-card">
      <h3>{t(language, 'upsellTitle')}</h3>
      <p>{t(language, 'upsellText')}</p>

      {status === 'sent' ? (
        <p className="upsell-thanks">{t(language, 'upsellThanks')}</p>
      ) : (
        <form className="upsell-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t(language, 'upsellNamePlaceholder')}
          />
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={t(language, 'upsellContactPlaceholder')}
            required
          />
          <button type="submit" className="ghost-button" disabled={status === 'sending'}>
            {t(language, 'upsellSubmit')}
          </button>
        </form>
      )}
      {status === 'error' && <p className="error">{t(language, 'upsellError')}</p>}
    </div>
  );
}
