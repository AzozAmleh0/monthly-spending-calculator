import { isCategoryColor } from "@/lib/categories"
import type { Category, Frequency, Item, Period, SavedList } from "@/types"

const STORAGE_KEY = "spending-calculator:items"
const SAVED_LISTS_KEY = "spending-calculator:saved-lists"
const STORAGE_VERSION = 3
const SAVED_LISTS_VERSION = 2

/** Everything the app keeps on the device. */
export type StoredState = {
  items: Item[]
  /** Monthly income in ILS. 0 means "not set yet". */
  income: number
  categories: Category[]
}

type StoredData = StoredState & {
  version: number
}

export const emptyState: StoredState = { items: [], income: 0, categories: [] }

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
    // Items saved before categories existed have none.
    categoryId: typeof item.categoryId === "string" ? item.categoryId : null,
  }
}

function toItems(value: unknown): Item[] {
  if (!Array.isArray(value)) return []

  return value
    .map(toItem)
    .filter((item): item is Item => item !== null)
}

function toCategory(value: unknown): Category | null {
  if (typeof value !== "object" || value === null) return null
  const category = value as Record<string, unknown>

  const isValid =
    typeof category.id === "string" &&
    category.id.length > 0 &&
    typeof category.name === "string" &&
    category.name.trim().length > 0 &&
    isCategoryColor(category.color)

  if (!isValid) return null

  return {
    id: category.id as string,
    name: category.name as string,
    color: category.color as Category["color"],
  }
}

function toCategories(value: unknown): Category[] {
  if (!Array.isArray(value)) return []

  return value
    .map(toCategory)
    .filter((category): category is Category => category !== null)
}

/** Items pointing at a category that no longer exists lose it. */
function withKnownCategories(items: Item[], categories: Category[]): Item[] {
  const ids = new Set(categories.map((category) => category.id))
  return items.map((item) =>
    item.categoryId && !ids.has(item.categoryId)
      ? { ...item, categoryId: null }
      : item,
  )
}

/**
 * Reads the saved items, income and categories. Returns empty values if
 * nothing is saved or the saved data cannot be read. Data written by older
 * versions (no income, no categories) still loads.
 */
export function loadState(): StoredState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== "object" || parsed === null) return emptyState

    const { items, income, categories } = parsed as Partial<StoredData>
    const knownCategories = toCategories(categories)

    return {
      items: withKnownCategories(toItems(items), knownCategories),
      income: isIncome(income) ? income : 0,
      categories: knownCategories,
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
    // Lists saved before categories existed have none.
    categories: toCategories(list.categories),
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
