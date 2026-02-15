import Link from "next/link";
import type { WireItem } from "@/lib/news";
import { encodeStoryID } from "@/lib/news";
import { timeAgo } from "@/lib/time";
import { displaySection } from "@/lib/sections";

export function StoryLink(props: {
  item: WireItem;
  dense?: boolean;
  showThumb?: boolean;
}) {
  const { item } = props;
  const href = `/news/${encodeStoryID(item.url)}`;
  const section = displaySection(item.section).toUpperCase();

  return (
    <Link
      href={href}
      className="group block transition hover:bg-white/[0.03]"
    >
      <div className="flex items-start gap-4 px-4 py-3">
        {props.showThumb ? (
          <div className="relative mt-1 h-[64px] w-[96px] shrink-0 overflow-hidden rounded-xl border mx-hairline bg-white/[0.03]">
            {item.image_url ? (
              // Use <img> to avoid Next image domain config for MVP.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(var(--accent)/0.12),transparent_60%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))]" />
            )}
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <div
            className={[
              "mx-headline font-semibold leading-snug text-white/95 group-hover:underline",
              props.dense ? "text-[16px]" : "text-[18px]",
            ].join(" ")}
          >
            <span className={props.dense ? "mx-clamp-2" : "mx-clamp-3"}>
              {item.title}
            </span>
          </div>
          <div className="mx-mono mt-2 text-[11px] text-white/45">
            <span className="text-white/50">{timeAgo(item.published_at)}</span>
            {item.reading_time ? (
              <>
                <span className="text-white/25"> • </span>
                <span>{item.reading_time}</span>
              </>
            ) : null}
            <span className="text-white/25"> • </span>
            <span className="text-white/55">{section}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
