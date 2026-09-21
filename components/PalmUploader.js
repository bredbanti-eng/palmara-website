'use client';

import { useState, useRef, useCallback } from 'react';
import { classifyHand } from '../lib/handClassifier';
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

export default function PalmUploader() {
  const [status, setStatus] = useState('idle'); // idle | detecting | reading | error
  const [error, setError] = useState('');
  const [reading, setReading] = useState(null);
  const [language, setLanguage] = useState('en');
  const inputRef = useRef(null);

  const handleFile = useCallback(
    async (file) => {
      setError('');
      setReading(null);
      setStatus('detecting');

      try {
        const bitmap = await createImageBitmap(file);
        if (bitmap.width < MIN_DIMENSION || bitmap.height < MIN_DIMENSION) {
          setStatus('error');
          setError(
            'That photo is too small to read clearly. Please retake it closer up, in good light.'
          );
          return;
        }

        const landmarker = await getLandmarker();
        const result = landmarker.detect(bitmap);

        if (!result.landmarks || result.landmarks.length === 0) {
          setStatus('error');
          setError(
            "We couldn't clearly find a hand in that photo. Lay your palm flat, fill the frame, and make sure it's well lit, then try again."
          );
          return;
        }

        const classification = classifyHand(result.landmarks[0]);
        if (!classification) {
          setStatus('error');
          setError('Something about that photo confused our detector — please try a different angle.');
          return;
        }

        setStatus('reading');
        const res = await fetch('/api/generate-reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            handShape: classification.shape,
            seed: classification.seed,
            language,
          }),
        });

        if (!res.ok) throw new Error('generate-reading failed');
        const data = await res.json();
        setReading({ ...data, handShape: classification.shape });
        setStatus('idle');
      } catch (err) {
        console.error(err);
        setStatus('error');
        setError('Something went wrong reading that photo. Please try again.');
      }
    },
    [language]
  );

  return (
    <div className="uploader">
      <div className="language-row">
        <label>
          Reading language:{' '}
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </label>
      </div>

      <label className="drop">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          hidden
        />
        {status === 'detecting' && 'Reading your palm...'}
        {status === 'reading' && 'Writing your reading...'}
        {status === 'idle' && !reading && 'Tap to upload a photo of your open palm'}
        {status === 'idle' && reading && 'Upload a different photo'}
        {status === 'error' && 'Try again — tap to upload'}
      </label>

      {error && <p className="error">{error}</p>}

      {reading && <ReadingResult reading={reading} />}
    </div>
  );
}
