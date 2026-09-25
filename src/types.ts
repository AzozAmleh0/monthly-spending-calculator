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
}

export type ItemDraft = Omit<Item, "id">
