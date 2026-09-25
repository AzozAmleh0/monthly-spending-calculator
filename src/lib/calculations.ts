import type { Frequency, Item } from "@/types"

const DAYS_PER_YEAR = 365
const WEEKS_PER_YEAR = DAYS_PER_YEAR / 7
const MONTHS_PER_YEAR = 12

/** How many times an item is paid for over a year. */
export function occurrencesPerYear(frequency: Frequency): number {
  switch (frequency.type) {
    case "daily":
      return DAYS_PER_YEAR
    case "weekly":
      return WEEKS_PER_YEAR
    case "monthly":
      return MONTHS_PER_YEAR
    case "yearly":
      return 1
    case "timesPer":
      switch (frequency.period) {
        case "day":
          return frequency.times * DAYS_PER_YEAR
        case "week":
          return frequency.times * WEEKS_PER_YEAR
        case "month":
          return frequency.times * MONTHS_PER_YEAR
        case "year":
          return frequency.times
      }
    case "every":
      switch (frequency.period) {
        case "day":
          return DAYS_PER_YEAR / frequency.interval
        case "week":
          return WEEKS_PER_YEAR / frequency.interval
        case "month":
          return MONTHS_PER_YEAR / frequency.interval
        case "year":
          return 1 / frequency.interval
      }
  }
}

export function yearlyCost(item: Item): number {
  return item.price * occurrencesPerYear(item.frequency)
}

export function monthlyCost(item: Item): number {
  return yearlyCost(item) / MONTHS_PER_YEAR
}

export type Totals = {
  totalMonthly: number
  dailyRate: number
  weeklyRate: number
}

export function calculateTotals(items: Item[]): Totals {
  const totalYearly = items.reduce((sum, item) => sum + yearlyCost(item), 0)

  return {
    totalMonthly: totalYearly / MONTHS_PER_YEAR,
    dailyRate: totalYearly / DAYS_PER_YEAR,
    weeklyRate: totalYearly / WEEKS_PER_YEAR,
  }
}
