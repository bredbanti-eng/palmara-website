'use client';

import { useState, useRef, useCallback } from 'react';
import { classifyHand } from '../lib/handClassifier';
import { t } from '../lib/i18n';
import BirthDetailsForm from './BirthDetailsForm';
import ReadingResult from './ReadingResult';

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const MIN_DIMENSION = 400;

let landmarkerPromise = null;
function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = import('@mediapipe/tasks-vision').then(
      ({ HandLandmarker, FilesetResolver }) =>
        FilesetResolver.forVisionTasks(WASM_URL).then((fileset) =>
          HandLandmarker.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: MODEL_URL },
            runningMode: 'IMAGE',
            numHands: 1,
          })
        )
    );
  }
  return landmarkerPromise;
}

export default function PalmUploader({ language }) {
  // idle -> detecting -> details -> reading -> result (or -> error at any point)
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [classification, setClassification] = useState(null);
  const [reading, setReading] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    setError('');
    setReading(null);
    setStatus('detecting');

    try {
      const bitmap = await createImageBitmap(file);
      if (bitmap.width < MIN_DIMENSION || bitmap.height < MIN_DIMENSION) {
        setStatus('error');
        setError(t(language, 'errorTooSmall'));
        return;
      }

      const landmarker = await getLandmarker();
      const result = landmarker.detect(bitmap);

      if (!result.landmarks || result.landmarks.length === 0) {
        setStatus('error');
        setError(t(language, 'errorNoHand'));
        return;
      }

      const classified = classifyHand(result.landmarks[0]);
      if (!classified) {
        setStatus('error');
        setError(t(language, 'errorConfused'));
        return;
      }

      setClassification(classified);
      setStatus('details');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError(t(language, 'errorGeneric'));
    }
  }, [language]);

  const handleDetailsSubmit = useCallback(
    async (birthDetails) => {
      if (!classification) return;
      setStatus('reading');
      setError('');
      try {
        const res = await fetch('/api/generate-reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            handShape: classification.shape,
            seed: classification.seed,
            language,
            ...birthDetails,
          }),
        });

        if (!res.ok) throw new Error('generate-reading failed');
        const data = await res.json();
        setReading({ ...data, handShape: classification.shape, name: birthDetails.name });
        setStatus('result');
      } catch (err) {
        console.error(err);
        setStatus('error');
        setError(t(language, 'errorGeneric'));
      }
    },
    [classification, language]
  );

  const resetToUpload = () => {
    setStatus('idle');
    setError('');
    setClassification(null);
    setReading(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="uploader" id="uploader">
      {status !== 'details' && (
        <label className="drop" htmlFor="palm-photo-input">
          <input
            id="palm-photo-input"
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
            hidden
          />
          {status === 'detecting' && t(language, 'statusDetecting')}
          {status === 'reading' && t(language, 'statusReading')}
          {status === 'idle' && !reading && t(language, 'uploadIdle')}
          {status === 'result' && t(language, 'uploadDifferent')}
          {status === 'error' && t(language, 'uploadRetry')}
        </label>
      )}

      {error && <p className="error">{error}</p>}

      {status === 'details' && (
        <BirthDetailsForm language={language} onSubmit={handleDetailsSubmit} onBack={resetToUpload} />
      )}

      {status === 'result' && reading && <ReadingResult language={language} reading={reading} />}
    </div>
  );
}
