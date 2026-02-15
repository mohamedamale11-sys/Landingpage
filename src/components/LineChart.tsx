import { useMemo } from 'react'

type Series = {
  name: string
  color: string
  values: number[]
}

function pathFor(values: number[], w: number, h: number, pad: number, min: number, max: number) {
  const span = max - min || 1
  const dx = (w - pad * 2) / Math.max(1, values.length - 1)
  let d = ''
  for (let i = 0; i < values.length; i++) {
    const x = pad + i * dx
    const y = pad + (1 - (values[i] - min) / span) * (h - pad * 2)
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)} `
  }
  return d.trim()
}

export function LineChart(props: { series: Series[]; width?: number; height?: number }) {
  const w = props.width ?? 760
  const h = props.height ?? 320
  const pad = 14

  const { min, max } = useMemo(() => {
    let mn = Number.POSITIVE_INFINITY
    let mx = Number.NEGATIVE_INFINITY
    for (const s of props.series) {
      for (const v of s.values) {
        if (v < mn) mn = v
        if (v > mx) mx = v
      }
    }
    if (!Number.isFinite(mn) || !Number.isFinite(mx)) return { min: 0, max: 1 }
    return { min: mn, max: mx }
  }, [props.series])

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" aria-hidden="true">
      <defs>
        <linearGradient id="mxGrid" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="1" stopColor="rgba(255,255,255,0.02)" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width={w} height={h} fill="url(#mxGrid)" opacity="0.35" />

      {/* subtle horizontal guides */}
      {[0.2, 0.5, 0.8].map((t) => (
        <line
          key={t}
          x1={pad}
          y1={pad + t * (h - pad * 2)}
          x2={w - pad}
          y2={pad + t * (h - pad * 2)}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
        />
      ))}

      {props.series.map((s) => {
        const d = pathFor(s.values, w, h, pad, min, max)
        return (
          <g key={s.name}>
            <path d={d} fill="none" stroke={s.color} strokeWidth="2.2" strokeLinecap="round" />
            <path d={d} fill="none" stroke={s.color} strokeWidth="7.5" strokeLinecap="round" opacity="0.14" />
          </g>
        )
      })}
    </svg>
  )
}

