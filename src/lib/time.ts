export function timeAgo(iso: string, now = new Date()) {
  const d = new Date(iso)
  const ms = now.getTime() - d.getTime()
  const min = Math.floor(ms / 60_000)
  if (min < 1) return 'Hadda'
  if (min < 60) return `${min} daqiiqo kahor`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} saac kahor`
  const days = Math.floor(hr / 24)
  return `${days} maalmood kahor`
}
