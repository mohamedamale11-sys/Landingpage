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
    const controller = new AbortController();
    const timeoutMs = 6500;
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(u.toString(), {
      headers: { accept: "application/json" },
      cache: "force-cache",
      next: { revalidate: 30 },
      signal: controller.signal,
    });
    clearTimeout(t);
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
        "cache-control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ ok: false, items: [], error: "backend_unreachable" }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
          "cache-control": "public, s-maxage=5, stale-while-revalidate=30",
        },
      },
    );
  }
}
