import { fetchTopPrices } from "@/lib/prices";

function formatUSD(n: number) {
  const abs = Math.abs(n);
  const maxFrac = abs >= 1000 ? 0 : abs >= 1 ? 2 : 4;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: maxFrac,
  }).format(n);
}

function formatPct(n: number) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export async function PriceBar() {
  const items = await fetchTopPrices();
  if (!items.length) return null;

  return (
    <div className="border-b mx-hairline bg-black/40">
      <div className="mx-container">
        <div className="flex items-center gap-4 py-2">
          <div className="mx-mono hidden text-[11px] font-semibold tracking-widest text-white/55 sm:block">
            QIIMAHA TOOSKA AH
          </div>

          <div className="mx-mono flex flex-1 items-center gap-6 overflow-x-auto text-[12px] text-white/75 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((x) => (
              <div key={x.id} className="flex shrink-0 items-center gap-2">
                <span className="font-semibold text-white/85">{x.sym}</span>
                <span className="text-white/92">{formatUSD(x.priceUsd)}</span>
                {typeof x.change24hPct === "number" ? (
                  <span
                    className={
                      x.change24hPct < 0
                        ? "text-red-400/90"
                        : "text-emerald-400/90"
                    }
                  >
                    {formatPct(x.change24hPct)}
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mx-mono hidden text-[11px] text-white/30 md:block">
            Xog: CoinGecko
          </div>
        </div>
      </div>
    </div>
  );
}
