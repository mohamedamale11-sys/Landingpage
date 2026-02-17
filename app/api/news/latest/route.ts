import { cleanWireItems, type WireItem } from "@/lib/news";

const BACKEND = (
  process.env.NEWS_API_BASE || "https://mxcrypto-backend-1.onrender.com"
).replace(
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
      "items" in payload &&
      Array.isArray((payload as { items?: unknown[] }).items)
    ) {
      const obj = payload as {
        items: WireItem[];
        total?: number;
        limit?: number;
        offset?: number;
        next_offset?: number;
        has_more?: boolean;
      };
      const before = obj.items.length;
      const cleaned = cleanWireItems(obj.items);
      const removed = before - cleaned.length;
      payload = {
        ...obj,
        items: cleaned,
        total: typeof obj.total === "number" ? Math.max(0, obj.total - removed) : cleaned.length,
      };
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
      JSON.stringify({ ok: false, items: [], error: "backend_unreachable" }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  }
}
