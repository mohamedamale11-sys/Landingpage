import { cleanWireItems, type WireItem } from "@/lib/news";

const BACKEND = (
  process.env.NEWS_API_BASE || "https://mxcrypto-backend-1.onrender.com"
).replace(
  /\/+$/,
  "",
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const target = url.searchParams.get("url") || "";
  if (!target.trim()) {
    return new Response(
      JSON.stringify({ ok: false, error: "missing url" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }

  const u = new URL(`${BACKEND}/api/news/item`);
  for (const [k, v] of url.searchParams.entries()) {
    u.searchParams.set(k, v);
  }

  try {
    const controller = new AbortController();
    const timeoutMs = 6500;
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(u.toString(), {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(t);

    let payload: unknown;
    try {
      payload = await res.json();
    } catch {
      const body = await res.text();
      return new Response(body, {
        status: res.status,
        headers: {
          "content-type": res.headers.get("content-type") || "application/json",
          "cache-control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    if (
      payload &&
      typeof payload === "object" &&
      "item" in payload &&
      (payload as { item?: unknown }).item &&
      typeof (payload as { item?: unknown }).item === "object"
    ) {
      const obj = payload as { ok?: boolean; item?: WireItem };
      const cleaned = cleanWireItems(obj.item ? [obj.item] : []);
      if (cleaned.length === 0) {
        return new Response(JSON.stringify({ ok: false, error: "not found" }), {
          status: 404,
          headers: {
            "content-type": "application/json",
            "cache-control": "no-store, no-cache, must-revalidate",
          },
        });
      }
      payload = { ...obj, item: cleaned[0] };
    }

    return new Response(JSON.stringify(payload), {
      status: res.status,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: "backend_unreachable" }),
      {
        status: 502,
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  }
}
