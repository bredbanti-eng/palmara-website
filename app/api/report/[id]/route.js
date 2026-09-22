import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseClient";

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const { data, error } = await getSupabase()
      .from("reports")
      .select("name, language, teaser_text, full_text, paid")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
