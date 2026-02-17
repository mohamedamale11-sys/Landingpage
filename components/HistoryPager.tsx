import Link from "next/link";

function hrefWithOffset(basePath: string, offset: number | null) {
  if (offset === null || offset <= 0) return basePath;
  return `${basePath}?offset=${offset}`;
}

export function HistoryPager(props: {
  basePath: string;
  offset: number;
  limit: number;
  hasMore: boolean;
  nextOffset: number | null;
  loadedCount: number;
}) {
  const prevOffset = props.offset > 0 ? Math.max(0, props.offset - props.limit) : null;
  const nextOffset = props.hasMore
    ? (typeof props.nextOffset === "number" ? props.nextOffset : props.offset + props.limit)
    : null;
  const currentPage = Math.floor(props.offset / props.limit) + 1;
  const start = props.offset + 1;
  const end = props.offset + Math.max(props.loadedCount, 0);

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t mx-hairline pt-4">
      <div className="mx-mono flex items-center gap-2 text-[11px] text-white/45">
        <span>
          Bogga <span className="text-white/70">{currentPage}</span>
        </span>
        {props.loadedCount > 0 ? (
          <>
            <span className="text-white/25">•</span>
            <span>
              Muujinaya <span className="text-white/70">{start}</span>-
              <span className="text-white/70">{end}</span>
            </span>
          </>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {prevOffset !== null ? (
          <Link
            href={hrefWithOffset(props.basePath, prevOffset)}
            className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white"
          >
            ← Newer
          </Link>
        ) : null}
        {nextOffset !== null ? (
          <Link
            href={hrefWithOffset(props.basePath, nextOffset)}
            className="mx-mono rounded-full border mx-hairline bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white"
          >
            Older →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
