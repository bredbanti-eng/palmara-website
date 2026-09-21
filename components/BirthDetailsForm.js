'use client';

import { useState } from 'react';
import { t } from '../lib/i18n';

export default function BirthDetailsForm({ language, onSubmit, onBack }) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthTimeUnknown, setBirthTimeUnknown] = useState(false);
  const [birthPlace, setBirthPlace] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !dob || !birthPlace.trim() || (!birthTimeUnknown && !birthTime)) {
      setError(t(language, 'formError'));
      return;
    }
    setError('');
    onSubmit({
      name: name.trim(),
      dob,
      birthTime: birthTimeUnknown ? null : birthTime,
      birthTimeUnknown,
      birthPlace: birthPlace.trim(),
    });
  };

  return (
    <form className="details-form" onSubmit={handleSubmit}>
      <h2>{t(language, 'formTitle')}</h2>
      <p className="form-subtitle">{t(language, 'formSubtitle')}</p>

      <label className="field">
        <span>{t(language, 'nameLabel')}</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t(language, 'namePlaceholder')}
        />
      </label>

      <label className="field">
        <span>{t(language, 'dobLabel')}</span>
        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
      </label>

      <label className="field">
        <span>{t(language, 'timeLabel')}</span>
        <input
          type="time"
          value={birthTime}
          onChange={(e) => setBirthTime(e.target.value)}
          disabled={birthTimeUnknown}
        />
      </label>

      <label className="field checkbox">
        <input
          type="checkbox"
          checked={birthTimeUnknown}
          onChange={(e) => setBirthTimeUnknown(e.target.checked)}
        />
        <span>{t(language, 'timeUnknownLabel')}</span>
      </label>

      <label className="field">
        <span>{t(language, 'placeLabel')}</span>
        <input
          type="text"
          value={birthPlace}
          onChange={(e) => setBirthPlace(e.target.value)}
          placeholder={t(language, 'placePlaceholder')}
        />
      </label>

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="ghost-button" onClick={onBack}>
          {t(language, 'formBack')}
        </button>
        <button type="submit" className="pay-button">
          {t(language, 'formSubmit')}
        </button>
      </div>
    </form>
  );
}
