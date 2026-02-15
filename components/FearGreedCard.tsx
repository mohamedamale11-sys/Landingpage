import { fetchFearGreed } from "@/lib/sentiment";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export async function FearGreedCard() {
  const fng = await fetchFearGreed();
  if (!fng) return null;

  const v = clamp(fng.value, 0, 100);
  const pct = `${v}%`;

  return (
    <section className="mx-panel p-4">
      <div className="mx-mono text-[11px] font-semibold tracking-widest text-white/55">
        MARKET SENTIMENT
      </div>

      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <div className="mx-headline text-[34px] font-semibold leading-none text-white">
            {v}
          </div>
          <div className="mx-mono mt-2 text-[12px] text-white/60">
            {fng.classification}
          </div>
        </div>

        <div className="w-[140px]">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[rgb(var(--accent))]"
              style={{ width: pct }}
            />
          </div>
          <div className="mx-mono mt-2 text-[11px] text-white/35">
            Source: Alternative.me
          </div>
        </div>
      </div>
    </section>
  );
}

