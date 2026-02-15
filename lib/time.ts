export function formatDateUTC(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(d);
}

export function timeAgo(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const abs = Math.abs(seconds);
  const sign = seconds >= 0 ? "" : "in ";
  const suffix = seconds >= 0 ? " ago" : "";

  const units: Array<[number, string]> = [
    [60, "s"],
    [60 * 60, "m"],
    [24 * 60 * 60, "h"],
    [7 * 24 * 60 * 60, "d"],
  ];

  if (abs < units[0][0]) return `${sign}${abs}s${suffix}`;
  if (abs < units[1][0]) return `${sign}${Math.floor(abs / 60)}m${suffix}`;
  if (abs < units[2][0]) return `${sign}${Math.floor(abs / 3600)}h${suffix}`;
  if (abs < units[3][0]) return `${sign}${Math.floor(abs / 86400)}d${suffix}`;
  return formatDateUTC(iso);
}

