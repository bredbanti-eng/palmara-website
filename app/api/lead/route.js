import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// Captures interest from the post-report upsell card ("curious when your
// Mahadasha begins?"). This does not generate or sell anything yet — it
// just records who to reach out to once that product exists.
export async function POST(req) {
  try {
    const { reportId, name, contact, interest } = await req.json();
    if (!contact || !contact.trim()) {
      return NextResponse.json({ error: 'Missing contact' }, { status: 400 });
    }

    const db = supabaseAdmin();
    const { error } = await db.from('leads').insert({
      report_id: reportId || null,
      name: name || null,
      contact: contact.trim(),
      interest: interest || 'mahadasha',
    });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('lead error', err);
    return NextResponse.json({ error: 'Could not save interest' }, { status: 500 });
  }
}
