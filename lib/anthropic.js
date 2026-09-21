const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5-20250929';

// Splitting the response on this exact line is how generate-reading tells
// the free teaser apart from the paid-only full reading. Keep it in sync
// with app/api/generate-reading/route.js and app/api/verify-payment/route.js.
export const UNLOCK_DELIMITER = '===UNLOCK===';

export async function generatePalmReading({ meaning, seedDetails, language }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const languageInstruction =
    language === 'hi' ? 'Write the entire reading in Hindi.' : 'Write the entire reading in English.';

  const prompt = `You are writing a warm, personalized "palm reading" for a website called Palmara.
The reading is based on a traditional palmistry hand-shape classification computed from a real photo
of the visitor's hand (via measured finger-length-to-palm-length and palm-width-to-length ratios) — it
is a traditional classification system, not scientifically validated fortune telling, so keep the tone
warm and reflective rather than making hard predictive claims.

Hand shape: ${meaning.label} hand (${meaning.palm} palm, ${meaning.fingers} fingers)
Traditional traits associated with this shape: ${meaning.traits.join(', ')}
Personal texture to weave in naturally, as inspiration only (do not list these outright): ${seedDetails.join('; ')}

${languageInstruction}

Write two parts, separated by a line that contains exactly "${UNLOCK_DELIMITER}" and nothing else:
1. A short 2-3 sentence teaser (warm, a little intriguing, makes them want to read more).
2. The full reading (250-350 words) covering personality, how they approach relationships, and a
   reflective note on strengths to lean into right now. End with one gentle, actionable thought.

Do not include any headings or labels. Just the teaser sentences, then the delimiter line on its own,
then the full reading.`;

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const text = (data.content ?? []).map((c) => c.text ?? '').join('');
  return text.trim();
}
