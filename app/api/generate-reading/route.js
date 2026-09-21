import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { generatePalmReading, UNLOCK_DELIMITER } from '../../../lib/anthropic';
import { HAND_SHAPE_MEANINGS } from '../../../lib/handClassifier';

const VALID_SHAPES = Object.keys(HAND_SHAPE_MEANINGS);

export async function POST(req) {
  try {
    const {
      handShape,
      seed,
      language,
      name,
      dob,
      birthTime,
      birthTimeUnknown,
      birthPlace,
    } = await req.json();

    if (!VALID_SHAPES.includes(handShape) || !Number.isFinite(seed)) {
      return NextResponse.json({ error: 'Invalid hand shape or seed' }, { status: 400 });
    }
    if (!name || !dob || !birthPlace || (!birthTimeUnknown && !birthTime)) {
      return NextResponse.json({ error: 'Missing birth details' }, { status: 400 });
    }

    const lang = language === 'hi' ? 'hi' : 'en';
    const meaning = HAND_SHAPE_MEANINGS[handShape];
    const seedDetails = [
      `a palm-to-finger ratio that lands this hand in the ${meaning.label.toLowerCase()} family`,
      `a distinguishing detail code of ${seed} from their exact proportions`,
    ];

    // Every submission includes the visitor's name and birth details, so
    // each reading is personalized rather than shared/cached across
    // visitors — we always generate and store a fresh row.
    const reportText = await generatePalmReading({
      meaning,
      seedDetails,
      language: lang,
      name,
      dob,
      birthTime: birthTimeUnknown ? null : birthTime,
      birthTimeUnknown: Boolean(birthTimeUnknown),
      birthPlace,
    });

    const [teaser] = reportText.split(UNLOCK_DELIMITER).map((s) => s?.trim());

    const db = supabaseAdmin();
    const { data: inserted, error: insertError } = await db
      .from('reports')
      .insert({
        hand_shape: handShape,
        seed,
        language: lang,
        report_text: reportText,
        name,
        dob,
        birth_time: birthTimeUnknown ? null : birthTime,
        birth_time_unknown: Boolean(birthTimeUnknown),
        birth_place: birthPlace,
      })
      .select('id')
      .single();
    if (insertError) throw insertError;

    return NextResponse.json({ id: inserted.id, teaser: teaser || reportText });
  } catch (err) {
    console.error('generate-reading error', err);
    return NextResponse.json({ error: 'Could not generate reading' }, { status: 500 });
  }
}
