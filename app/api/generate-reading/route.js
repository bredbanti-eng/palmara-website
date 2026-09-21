import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { generatePalmReading, UNLOCK_DELIMITER } from '../../../../lib/anthropic';
import { HAND_SHAPE_MEANINGS } from '../../../../lib/handClassifier';

const VALID_SHAPES = Object.keys(HAND_SHAPE_MEANINGS);

export async function POST(req) {
    try {
          const { handShape, seed, language } = await req.json();

      if (!VALID_SHAPES.includes(handShape) || !Number.isFinite(seed)) {
              return NextResponse.json({ error: 'Invalid hand shape or seed' }, { status: 400 });
      }
          const lang = language === 'hi' ? 'hi' : 'en';

      const db = supabaseAdmin();

      // Reuse a cached reading for the same (shape, seed, language) so the
      // same photo doesn't trigger a new Gemini call every time.
      const { data: existing, error: lookupError } = await db
            .from('reports')
            .select('id, report_text, paid')
            .eq('hand_shape', handShape)
            .eq('seed', seed)
            .eq('language', lang)
            .maybeSingle();

      if (lookupError) throw lookupError;

      if (existing) {
              const [teaser, full] = existing.report_text.split(UNLOCK_DELIMITER).map((s) => s?.trim());
              return NextResponse.json({
                        id: existing.id,
                        teaser: teaser || existing.report_text,
                        ...(existing.paid ? { full } : {}),
              });
      }

      const meaning = HAND_SHAPE_MEANINGS[handShape];
          const seedDetails = [
                  `a palm-to-finger ratio that lands this hand in the ${meaning.label.toLowerCase()} family`,
                  `a distinguishing detail code of ${seed} from their exact proportions`,
                ];

      const reportText = await generatePalmReading({ meaning, seedDetails, language: lang });
          const [teaser] = reportText.split(UNLOCK_DELIMITER).map((s) => s?.trim());

      const { data: inserted, error: insertError } = await db
            .from('reports')
            .upsert(
              { hand_shape: handShape, seed, language: lang, report_text: reportText },
              { onConflict: 'hand_shape,seed,language' }
                    )
            .select('id')
            .single();

      if (insertError) throw insertError;

      return NextResponse.json({ id: inserted.id, teaser: teaser || reportText });
    } catch (err) {
          console.error('generate-reading error', err);
          return NextResponse.json({ error: 'Could not generate reading' }, { status: 500 });
    }
}
