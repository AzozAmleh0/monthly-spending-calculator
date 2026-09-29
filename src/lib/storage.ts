import type { Frequency, Item, Period, SavedList } from "@/types"

const STORAGE_KEY = "spending-calculator:items"
const SAVED_LISTS_KEY = "spending-calculator:saved-lists"
const STORAGE_VERSION = 2
const SAVED_LISTS_VERSION = 1

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

/**
 * Validates one saved item and fills in anything a older version did not
 * write. Returns null when it cannot be trusted.
 */
function toItem(value: unknown): Item | null {
  if (typeof value !== "object" || value === null) return null
  const item = value as Record<string, unknown>

  const isValid =
    typeof item.id === "string" &&
    item.id.length > 0 &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price > 0 &&
    isFrequency(item.frequency)

  if (!isValid) return null

  return {
    id: item.id as string,
    name: item.name as string,
    price: item.price as number,
    frequency: item.frequency as Item["frequency"],
    // Items saved before the switch existed were all counted.
    enabled: item.enabled !== false,
  }
}

function toItems(value: unknown): Item[] {
  if (!Array.isArray(value)) return []

  return value
    .map(toItem)
    .filter((item): item is Item => item !== null)
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
      items: toItems(items),
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

type StoredSavedLists = {
  version: number
  lists: SavedList[]
}

function toSavedList(value: unknown): SavedList | null {
  if (typeof value !== "object" || value === null) return null
  const list = value as Record<string, unknown>

  const isValid =
    typeof list.id === "string" &&
    list.id.length > 0 &&
    typeof list.name === "string" &&
    list.name.trim().length > 0 &&
    typeof list.savedAt === "string" &&
    Array.isArray(list.items) &&
    isIncome(list.income)

  if (!isValid) return null

  return {
    id: list.id as string,
    name: list.name as string,
    savedAt: list.savedAt as string,
    items: toItems(list.items),
    income: list.income as number,
  }
}

/** Reads the named saves. Anything unreadable comes back as an empty list. */
export function loadSavedLists(): SavedList[] {
  try {
    const raw = window.localStorage.getItem(SAVED_LISTS_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== "object" || parsed === null) return []

    const { lists } = parsed as Partial<StoredSavedLists>

    if (!Array.isArray(lists)) return []

    return lists
      .map(toSavedList)
      .filter((list): list is SavedList => list !== null)
  } catch {
    return []
  }
}

/** Writes the named saves. Failures are ignored so the app keeps working. */
export function saveSavedLists(lists: SavedList[]): void {
  try {
    const data: StoredSavedLists = { version: SAVED_LISTS_VERSION, lists }
    window.localStorage.setItem(SAVED_LISTS_KEY, JSON.stringify(data))
  } catch {
    // Storage can be unavailable (private mode, quota). Nothing to do.
  }
}
