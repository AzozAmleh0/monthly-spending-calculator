export type Period = "day" | "week" | "month" | "year"

export type Frequency =
  | { type: "daily" }
  | { type: "weekly" }
  | { type: "monthly" }
  | { type: "yearly" }
  | { type: "timesPer"; times: number; period: Period }
  | { type: "every"; interval: number; period: Period }

export type FrequencyType = Frequency["type"]

export type Item = {
  id: string
  name: string
  price: number
  frequency: Frequency
  /** Switched-off items stay in the list but are left out of every total. */
  enabled: boolean
}

/** What the form produces: the rest of an item is managed by the app. */
export type ItemDraft = Omit<Item, "id" | "enabled">

/** A named copy of the whole list, kept so it can be loaded back later. */
export type SavedList = {
  id: string
  name: string
  /** ISO date of when it was saved. */
  savedAt: string
  items: Item[]
  income: number
}
