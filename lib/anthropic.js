const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

// Splitting the response on this exact line is how generate-reading tells
// the free teaser apart from the paid-only full reading. Keep it in sync
// with app/api/generate-reading/route.js and app/api/verify-payment/route.js.
export const UNLOCK_DELIMITER = '===UNLOCK===';

async function callGemini(prompt, maxOutputTokens) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const res = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? '')
    .join('');
  return text.trim();
}

/**
 * Generates the personalized report shown after someone uploads a palm
 * photo and fills in their birth details. Blends the traditional
 * palmistry hand-shape classification (computed client-side from real
 * hand-landmark measurements) with a warm, Kundli-style narrative built
 * from their name and birth details.
 *
 * IMPORTANT: this is AI-written reflective narrative text, not a real
 * ephemeris/Panchang calculation of planetary positions or Mahadasha
 * periods — the prompt below is written to keep that distinction honest
 * (no fabricated precise dates or planetary claims).
 */
export async function generatePalmReading({
  meaning,
  seedDetails,
  language,
  name,
  dob,
  birthTime,
  birthTimeUnknown,
  birthPlace,
}) {
  const languageInstruction =
    language === 'hi' ? 'Write the entire reading in Hindi.' : 'Write the entire reading in English.';

  const birthTimeLine = birthTimeUnknown
    ? 'Exact birth time is not known — do not reference a specific time of day.'
    : `Birth time: ${birthTime}`;

  const prompt = `You are writing a warm, personalized report for a website called Palmara that blends
traditional hand-shape palmistry with a reflective, Kundli-style birth-detail narrative.

Visitor's name: ${name}
Date of birth: ${dob}
${birthTimeLine}
Place of birth: ${birthPlace}

Hand shape (from a real photo, measured finger-length-to-palm-length and palm-width-to-length ratios): ${meaning.label} hand (${meaning.palm} palm, ${meaning.fingers} fingers)
Traditional traits associated with this hand shape: ${meaning.traits.join(', ')}
Personal texture to weave in naturally, as inspiration only (do not list these outright): ${seedDetails.join('; ')}

This is a traditional, reflective practice, not scientifically validated fortune telling and not a
precise astronomical calculation — never invent exact planetary positions, degrees, or specific
future dates. Keep the tone warm, personal, and a little intriguing.

${languageInstruction}
Address the visitor by name at least once. Write two parts, separated by a line that contains exactly
"${UNLOCK_DELIMITER}" and nothing else:

1. TEASER (revealed for free, 2-3 sentences): open with something specific and true-feeling about
   them (drawing on their hand shape and birth details together) that earns trust, then end on a
   half-finished thought that creates real curiosity about what's in the full report — without being
   a cheap cliffhanger.
2. FULL REPORT (locked until payment, 300-400 words): covering their core nature, how they approach
   relationships and work, a current life theme worth paying attention to, and one gentle, actionable
   thought to close on. Do not include headings or labels — flowing, personal prose.

Output only the teaser sentences, then the delimiter line on its own, then the full report.`;

  return callGemini(prompt, 900);
}
