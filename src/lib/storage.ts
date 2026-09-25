import type { Frequency, Item, Period } from "@/types"

const STORAGE_KEY = "spending-calculator:items"
const STORAGE_VERSION = 2

/** Everything the app keeps on the device. */
export type StoredState = {
  items: Item[]
  /** Monthly income in ILS. 0 means "not set yet". */
  income: number
}

type StoredData = StoredState & {
  version: number
}

export const emptyState: StoredState = { items: [], income: 0 }

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

export function isIncome(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
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
 * Reads the saved items and income. Returns empty values if nothing is saved
 * or the saved data cannot be read. Data written by version 1 (which had no
 * income) still loads.
 */
export function loadState(): StoredState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== "object" || parsed === null) return emptyState

    const { items, income } = parsed as Partial<StoredData>

    return {
      items: Array.isArray(items) ? items.filter(isItem) : [],
      income: isIncome(income) ? income : 0,
    }
  } catch {
    return emptyState
  }
}

/** Writes the full state. Failures are ignored so the app keeps working. */
export function saveState(state: StoredState): void {
  try {
    const data: StoredData = { version: STORAGE_VERSION, ...state }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage can be unavailable (private mode, quota). Nothing to do.
  }
}
