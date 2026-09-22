import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseClient";

// PDFs are always in English (jsPDF's default fonts don't render Devanagari
// correctly). For a Hindi reading, this translates to English only the
// first time a download is requested, then caches it — so repeat downloads
// never re-spend on generation.
export async function POST(request) {
  try {
    const { reportId } = await request.json();
    if (!reportId) {
      return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: report, error } = await supabase
      .from("reports")
      .select("language, full_text, full_text_en")
      .eq("id", reportId)
      .single();

    if (error || !report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Already English, or already translated and cached — nothing to do.
    if (report.language !== "hi") {
      return NextResponse.json({ englishText: report.full_text });
    }
    if (report.full_text_en) {
      return NextResponse.json({ englishText: report.full_text_en });
    }

    const prompt = `Translate the following Vedic astrology reading from Hindi to natural, fluent English. Keep the same structure, tone, and any tables formatted the same way. Do not add commentary — output only the translated reading.\n\n${report.full_text}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Translation failed:", errText);
      return NextResponse.json({ error: "Translation failed" }, { status: 502 });
    }

    const data = await response.json();
    const englishText =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") || "";

    await supabase.from("reports").update({ full_text_en: englishText }).eq("id", reportId);

    return NextResponse.json({ englishText });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
