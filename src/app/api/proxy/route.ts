import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "DLM-World-Radio/1.0",
      },
    });

    clearTimeout(timeout);

    if (!response.ok || !response.body) {
      return NextResponse.json({ error: "Stream unavailable" }, { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "audio/mpeg";

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache, no-store",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch {
    return NextResponse.json({ error: "Proxy error" }, { status: 502 });
  }
}
