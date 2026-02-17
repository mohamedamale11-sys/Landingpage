import Link from "next/link";
import type { WireItem } from "@/lib/news";
import { encodeStoryID } from "@/lib/news";
import { timeAgo } from "@/lib/time";
import { getSentimentMeta } from "@/lib/sentiment";

export function StoryLink(props: {
  item: WireItem;
  dense?: boolean;
  showThumb?: boolean;
  clean?: boolean;
}) {
  const { item } = props;
  const href = `/news/${encodeStoryID(item.url)}`;
  const sentiment = getSentimentMeta(item.sentiment);

  return (
    <Link
      href={href}
      scroll
      className={[
        "group block rounded-[8px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent)/0.35)]",
        props.clean ? "" : "hover:bg-white/[0.03]",
      ].join(" ")}
    >
      <div
        className={[
          "flex items-start gap-4",
          props.clean ? "px-0 py-4" : "px-4 py-3",
          props.showThumb ? "min-h-[108px]" : "",
        ].join(" ")}
      >
        {props.showThumb ? (
          <div
            className={[
              "relative mt-1 h-[64px] w-[96px] shrink-0 overflow-hidden",
              props.clean
                ? "rounded-[8px] bg-white/[0.02]"
                : "rounded-xl border mx-hairline bg-white/[0.03]",
            ].join(" ")}
          >
            {item.image_url ? (
              <img
                src={item.image_url}
                alt=""
                width={96}
                height={64}
                sizes="96px"
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
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
              "mx-headline font-semibold leading-snug text-white/95",
              props.clean ? "group-hover:text-white" : "group-hover:underline",
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
            {sentiment ? (
              <>
                <span className="text-white/25"> • </span>
                <span className={["font-semibold", sentiment.className].join(" ")}>
                  {sentiment.label}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
