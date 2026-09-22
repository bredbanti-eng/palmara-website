import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseClient";

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const HAND_SHAPE_TRAITS = {
  earth: {
    en: "a grounded, practical hand shape — square palm, shorter fingers, often linked to being steady and hands-on.",
    hi: "एक स्थिर, व्यावहारिक हाथ की आकृति — चौकोर हथेली, छोटी उंगलियाँ, अक्सर स्थिरता और व्यावहारिकता से जुड़ी।",
  },
  air: {
    en: "a square palm with long fingers — traditionally linked to sharp thinking and curiosity.",
    hi: "चौकोर हथेली और लंबी उंगलियाँ — पारंपरिक रूप से तीव्र सोच और जिज्ञासा से जुड़ी।",
  },
  fire: {
    en: "a rectangular palm with shorter fingers — often associated with energy and initiative.",
    hi: "आयताकार हथेली और छोटी उंगलियाँ — अक्सर ऊर्जा और पहल करने की क्षमता से जुड़ी।",
  },
  water: {
    en: "a long, narrow palm with long fingers — traditionally tied to sensitivity and imagination.",
    hi: "लंबी, संकरी हथेली और लंबी उंगलियाँ — पारंपरिक रूप से संवेदनशीलता और कल्पनाशीलता से जुड़ी।",
  },
};

function buildPrompt({ handShape, seed, language, name, dob, birthTime, birthTimeUnknown, birthPlace }) {
  const rand = seededRandom(seed);
  const heartLine = rand() > 0.5 ? { en: "deep and clearly marked", hi: "गहरी और स्पष्ट रूप से अंकित" } : { en: "faint and delicate", hi: "हल्की और नाज़ुक" };
  const fateLine = rand() > 0.4 ? { en: "runs unusually far up the palm", hi: "हथेली में असामान्य रूप से ऊपर तक जाती है" } : { en: "starts closer to the middle of the hand", hi: "हथेली के मध्य के करीब से शुरू होती है" };
  const traits = HAND_SHAPE_TRAITS[handShape]?.[language] || HAND_SHAPE_TRAITS.earth[language];
  const timeStr = birthTimeUnknown ? (language === "hi" ? "अज्ञात" : "unknown") : birthTime;

  if (language === "hi") {
    return `आप एक अनुभवी वैदिक ज्योतिषी और हस्त रेखा विशेषज्ञ हैं। "${name}" नाम के ग्राहक के लिए हिंदी में एक गर्मजोशी भरी, व्यक्तिगत रीडिंग लिखें, जिसमें हस्तरेखा और कुंडली दोनों का पुट हो। इस्तेमाल करने के लिए विवरण:
- हाथ की आकृति: ${traits}
- हृदय रेखा: ${heartLine.hi}
- भाग्य रेखा: ${fateLine.hi}
- जन्म तिथि: ${dob}, जन्म समय: ${timeStr}, जन्म स्थान: ${birthPlace}
लगभग 400 शब्द लिखें। पाठ को दो स्पष्ट भागों में बांटें, बिल्कुल इन्हीं शीर्षकों के साथ, हर एक अपनी लाइन पर:
===TEASER===
(यहाँ लगभग 80 शब्दों की एक झलक, जो उत्सुकता जगाए पर पूरी बात न बताए)
===FULL===
(यहाँ पूरी, विस्तृत रीडिंग)
कोई निश्चित भविष्यवाणी न करें — यह बताएं कि यह पैटर्न व्यक्ति के बारे में क्या सुझाव देता है।`;
  }

  return `You are an experienced Vedic astrologer and palmistry reader. Write a warm, personal-feeling reading in English for a customer named "${name}", blending palmistry with a Kundli-style astrological narrative. Details to use:
- Hand shape: ${traits}
- Heart line: ${heartLine.en}
- Fate line: ${fateLine.en}
- Date of birth: ${dob}, time of birth: ${timeStr}, place of birth: ${birthPlace}
Write about 400 words total. Split the text into exactly two parts, using these exact markers each on their own line:
===TEASER===
(about 80 words here — enough to feel personal and build curiosity, without giving everything away)
===FULL===
(the complete, detailed reading here)
Do not make definite predictions — describe what these patterns traditionally suggest about the person.`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { handShape, seed, language = "en" } = body;

    if (!handShape || typeof seed !== "number") {
      return NextResponse.json({ error: "Missing handShape or seed" }, { status: 400 });
    }

    const prompt = buildPrompt(body);

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
      console.error("Gemini API error:", errText);
      return NextResponse.json({ error: "Reading generation failed" }, { status: 502 });
    }

    const data = await response.json();
    const rawText =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") || "";

    const teaserMatch = rawText.split("===TEASER===")[1]?.split("===FULL===")[0]?.trim();
    const fullMatch = rawText.split("===FULL===")[1]?.trim();
    const teaserText = teaserMatch || rawText.slice(0, 300);
    const fullText = fullMatch || rawText;

    const { data: inserted, error } = await getSupabase()
      .from("reports")
      .insert({
        name: body.name,
        email: body.email,
        dob: body.dob,
        birth_time: body.birthTime,
        birth_time_unknown: body.birthTimeUnknown || false,
        birth_place: body.birthPlace,
        hand_shape: handShape,
        seed,
        language,
        teaser_text: teaserText,
        full_text: fullText,
        paid: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Could not save report" }, { status: 500 });
    }

    return NextResponse.json({ teaserText, fullText, reportId: inserted.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
