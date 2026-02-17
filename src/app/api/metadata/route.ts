import { NextRequest, NextResponse } from "next/server";
import { getTags, getCountryCodes, getLanguages, getCodecs } from "@/lib/radio-browser";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") || "tags";

  try {
    let data: unknown[] = [];
    switch (type) {
      case "tags":
        data = await getTags(200);
        break;
      case "countries":
        data = await getCountryCodes(250);
        break;
      case "languages":
        data = await getLanguages(100);
        break;
      case "codecs":
        data = await getCodecs();
        break;
      default:
        data = [];
    }

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 });
  }
}
