const BACKEND = (
  process.env.NEWS_API_BASE || "https://mxcrypto-backend-1.onrender.com"
).replace(/\/+$/, "");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let bodyText = "";
  try {
    bodyText = await req.text();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid request body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const upstream = await fetch(`${BACKEND}/api/ai/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "text/event-stream,application/json",
    },
    body: bodyText,
    cache: "no-store",
  });

  const contentType = upstream.headers.get("content-type") || "";
  if (!upstream.body) {
    const fallback = await upstream.text();
    return new Response(fallback, {
      status: upstream.status,
      headers: {
        "content-type": contentType || "application/json",
        "cache-control": "no-store",
      },
    });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type": contentType || "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-store, must-revalidate",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}

