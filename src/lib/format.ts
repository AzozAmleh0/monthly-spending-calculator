import type { Frequency, Period } from "@/types"

const currencyFormatter = new Intl.NumberFormat("en-IL", {
  style: "currency",
  currency: "ILS",
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

const PLURAL_PERIOD: Record<Period, string> = {
  day: "days",
  week: "weeks",
  month: "months",
  year: "years",
}

/** Readable text for a frequency, e.g. "2 times per day" or "Every 2 days". */
export function frequencyLabel(frequency: Frequency): string {
  switch (frequency.type) {
    case "daily":
      return "Daily"
    case "weekly":
      return "Weekly"
    case "monthly":
      return "Monthly"
    case "yearly":
      return "Yearly"
    case "timesPer":
      return frequency.times === 1
        ? `1 time per ${frequency.period}`
        : `${frequency.times} times per ${frequency.period}`
    case "every":
      return frequency.interval === 1
        ? `Every ${frequency.period}`
        : `Every ${frequency.interval} ${PLURAL_PERIOD[frequency.period]}`
  }
}
