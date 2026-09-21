'use client';

import { useState } from 'react';
import PaymentButton from './PaymentButton';

export default function ReadingResult({ reading }) {
  const [full, setFull] = useState(reading.full || null);
  const paid = Boolean(full);

  const label = reading.handShape
    ? reading.handShape[0].toUpperCase() + reading.handShape.slice(1)
    : '';

  return (
    <div className="reading">
      <h2>Your hand: {label}</h2>
      <p>{reading.teaser}</p>

      {paid ? (
        <p className="full-text">{full}</p>
      ) : (
        <div className="locked">
          <p className="locked-hint">
            The rest of your reading is ready — unlock it to keep reading.
          </p>
          <PaymentButton reportId={reading.id} onUnlocked={(fullText) => setFull(fullText)} />
        </div>
      )}
    </div>
  );
}
