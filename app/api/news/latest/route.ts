const BACKEND = (process.env.NEWS_API_BASE || "http://127.0.0.1:8000").replace(
  /\/+$/,
  "",
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const u = new URL(`${BACKEND}/api/news/latest`);
  for (const [k, v] of url.searchParams.entries()) {
    u.searchParams.set(k, v);
  }

  try {
    const res = await fetch(u.toString(), {
      headers: { accept: "application/json" },
      // Keep it fast; the page fetch uses revalidate anyway.
      cache: "no-store",
    });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ ok: false, items: [], error: "backend_unreachable" }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }
}
