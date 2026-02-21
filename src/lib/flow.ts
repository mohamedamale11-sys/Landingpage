export type FlowListItem = {
  title: string
  subtitle: string
  valueSOL: number
  rawValue: string
}

export type FlowMetrics = {
  totalTrades: number
  uniqueWallets: number
  activeWallets: number
}

export type FlowSnapshot = {
  windowHours: number
  updatedAt: number
  inflow: FlowListItem[]
  outflow: FlowListItem[]
  metrics: FlowMetrics
}

type GenericRecord = Record<string, unknown>

export function createEmptyFlowSnapshot(windowHours = 24): FlowSnapshot {
  return {
    windowHours,
    updatedAt: Date.now(),
    inflow: [],
    outflow: [],
    metrics: {
      totalTrades: 0,
      uniqueWallets: 0,
      activeWallets: 0,
    },
  }
}

export function hasFlowData(snapshot: FlowSnapshot | null): snapshot is FlowSnapshot {
  if (!snapshot) return false
  return snapshot.inflow.length > 0 || snapshot.outflow.length > 0
}

function toNumber(input: unknown): number {
  if (typeof input === 'number' && Number.isFinite(input)) return input
  if (typeof input === 'string') {
    const cleaned = input.replace(/,/g, '').trim()
    const numeric = cleaned.match(/[-+]?\d*\.?\d+/)
    if (numeric) {
      const parsed = Number.parseFloat(numeric[0])
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return 0
}

function toInt(input: unknown): number {
  const parsed = Math.round(toNumber(input))
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeString(input: unknown, fallback = ''): string {
  if (typeof input === 'string') {
    const value = input.trim()
    if (value.length > 0) return value
  }
  return fallback
}

function isRecord(input: unknown): input is GenericRecord {
  return !!input && typeof input === 'object' && !Array.isArray(input)
}

function mapListItems(rawItems: unknown): FlowListItem[] {
  if (!Array.isArray(rawItems)) return []

  const items: FlowListItem[] = []
  for (const entry of rawItems) {
    if (!isRecord(entry)) continue
    const title = normalizeString(entry.title, 'Unknown')
    const subtitle = normalizeString(entry.subtitle, '')
    const rawValue = normalizeString(entry.value, '0 SOL')
    const valueSOL = toNumber(rawValue)
    items.push({
      title,
      subtitle,
      valueSOL,
      rawValue,
    })
  }

  return items
}

export function applyFlowBlock(snapshot: FlowSnapshot, rawBlock: unknown): FlowSnapshot {
  if (!isRecord(rawBlock)) return snapshot

  const blockType = normalizeString(rawBlock.type).toLowerCase()
  const blockTitle = normalizeString(rawBlock.title).toLowerCase()

  const next: FlowSnapshot = {
    ...snapshot,
    updatedAt: Date.now(),
    metrics: { ...snapshot.metrics },
    inflow: [...snapshot.inflow],
    outflow: [...snapshot.outflow],
  }

  if (blockType === 'metrics' && blockTitle === 'overview' && Array.isArray(rawBlock.items)) {
    for (const item of rawBlock.items) {
      if (!isRecord(item)) continue
      const label = normalizeString(item.label).toLowerCase()
      const value = toInt(item.value)
      if (label.includes('total trades')) next.metrics.totalTrades = value
      if (label.includes('unique wallets')) next.metrics.uniqueWallets = value
      if (label.includes('active wallets')) next.metrics.activeWallets = value
    }
    return next
  }

  if (blockType === 'list') {
    if (blockTitle.includes('top inflow')) {
      next.inflow = mapListItems(rawBlock.items)
      return next
    }
    if (blockTitle.includes('top outflow')) {
      next.outflow = mapListItems(rawBlock.items)
      return next
    }
  }

  return next
}
