import { NextRequest, NextResponse } from "next/server";
import { RADIO_API_BASE, USER_AGENT } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const queryString = searchParams.toString();

  try {
    const res = await fetch(`${RADIO_API_BASE}/json/stations/search?${queryString}`, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 120 },
    });

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stations" }, { status: 500 });
  }
}
