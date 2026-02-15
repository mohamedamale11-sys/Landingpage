export function formatDateUTC(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("so-SO", {
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

  if (abs < 2) return "Hadda";

  const past = seconds >= 0;

  let n = abs;
  let unit = "ilbiriqsi";

  if (abs < 60) {
    n = abs;
    unit = "ilbiriqsi";
  } else if (abs < 60 * 60) {
    n = Math.floor(abs / 60);
    unit = "daqiiqo";
  } else if (abs < 24 * 60 * 60) {
    n = Math.floor(abs / 3600);
    unit = n === 1 ? "saac" : "saacado";
  } else if (abs < 7 * 24 * 60 * 60) {
    n = Math.floor(abs / 86400);
    unit = n === 1 ? "maalin" : "maalmood";
  } else {
    return formatDateUTC(iso);
  }

  return past ? `${n} ${unit} kahor` : `${n} ${unit} gudahood`;
}
