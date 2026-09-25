import type { Frequency, Item, Period } from "@/types"

const STORAGE_KEY = "spending-calculator:items"
const STORAGE_VERSION = 1

type StoredData = {
  version: number
  items: Item[]
}

const PERIODS: Period[] = ["day", "week", "month", "year"]

function isPeriod(value: unknown): value is Period {
  return typeof value === "string" && PERIODS.includes(value as Period)
}

function isWholeNumberAtLeastOne(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1
}

function isFrequency(value: unknown): value is Frequency {
  if (typeof value !== "object" || value === null) return false
  const frequency = value as Record<string, unknown>

  switch (frequency.type) {
    case "daily":
    case "weekly":
    case "monthly":
    case "yearly":
      return true
    case "timesPer":
      return isWholeNumberAtLeastOne(frequency.times) && isPeriod(frequency.period)
    case "every":
      return isWholeNumberAtLeastOne(frequency.interval) && isPeriod(frequency.period)
    default:
      return false
  }
}

function isItem(value: unknown): value is Item {
  if (typeof value !== "object" || value === null) return false
  const item = value as Record<string, unknown>

  return (
    typeof item.id === "string" &&
    item.id.length > 0 &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price > 0 &&
    isFrequency(item.frequency)
  )
}

/**
 * Reads the saved items. Returns an empty list if nothing is saved or the
 * saved data cannot be read.
 */
export function loadItems(): Item[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== "object" || parsed === null) return []

    const { items } = parsed as Partial<StoredData>
    if (!Array.isArray(items)) return []

    return items.filter(isItem)
  } catch {
    return []
  }
}

/** Writes the full items list. Failures are ignored so the app keeps working. */
export function saveItems(items: Item[]): void {
  try {
    const data: StoredData = { version: STORAGE_VERSION, items }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage can be unavailable (private mode, quota). Nothing to do.
  }
}
