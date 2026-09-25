import { z } from "zod"

import type { Frequency, FrequencyType, Item, ItemDraft, Period } from "@/types"

export const FREQUENCY_TYPES = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "timesPer",
  "every",
] as const satisfies readonly FrequencyType[]

export const PERIODS = ["day", "week", "month", "year"] as const

const priceSchema = z
  .string()
  .trim()
  .min(1, "Price is required.")
  .refine((value) => Number.isFinite(Number(value)), "Price must be a number.")
  .refine((value) => Number(value) > 0, "Price must be greater than 0.")

/** Shared rules for the X and N inputs: whole numbers of at least 1. */
function checkWholeNumber(
  value: string,
  field: "times" | "interval",
  label: string,
  ctx: z.RefinementCtx,
) {
  const trimmed = value.trim()
  const addIssue = (message: string) =>
    ctx.addIssue({ code: "custom", message, path: [field] })

  if (trimmed.length === 0) {
    addIssue(`${label} is required.`)
    return
  }
  if (!/^\d+$/.test(trimmed)) {
    addIssue(`${label} must be a whole number.`)
    return
  }
  if (Number(trimmed) < 1) {
    addIssue(`${label} must be at least 1.`)
  }
}

export const itemFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required."),
    price: priceSchema,
    frequencyType: z.enum(FREQUENCY_TYPES),
    times: z.string(),
    interval: z.string(),
    period: z.enum(PERIODS),
  })
  .superRefine((values, ctx) => {
    if (values.frequencyType === "timesPer") {
      checkWholeNumber(values.times, "times", "Times", ctx)
    }
    if (values.frequencyType === "every") {
      checkWholeNumber(values.interval, "interval", "Interval", ctx)
    }
  })

export type ItemFormValues = z.input<typeof itemFormSchema>

export const emptyFormValues: ItemFormValues = {
  name: "",
  price: "",
  frequencyType: "monthly",
  times: "1",
  interval: "2",
  period: "day",
}

/** Turns validated form values into the item shape used by the app. */
export function toItemDraft(values: ItemFormValues): ItemDraft {
  const period = values.period as Period
  let frequency: Frequency

  switch (values.frequencyType) {
    case "timesPer":
      frequency = { type: "timesPer", times: Number(values.times.trim()), period }
      break
    case "every":
      frequency = {
        type: "every",
        interval: Number(values.interval.trim()),
        period,
      }
      break
    default:
      frequency = { type: values.frequencyType }
  }

  return {
    name: values.name.trim(),
    price: Number(values.price.trim()),
    frequency,
  }
}

/** Fills the form with an existing item so it can be edited. */
export function toFormValues(item: Item): ItemFormValues {
  const { frequency } = item

  return {
    ...emptyFormValues,
    name: item.name,
    price: String(item.price),
    frequencyType: frequency.type,
    times: frequency.type === "timesPer" ? String(frequency.times) : emptyFormValues.times,
    interval: frequency.type === "every" ? String(frequency.interval) : emptyFormValues.interval,
    period:
      frequency.type === "timesPer" || frequency.type === "every"
        ? frequency.period
        : emptyFormValues.period,
  }
}

export const FREQUENCY_TYPE_LABELS: Record<(typeof FREQUENCY_TYPES)[number], string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  timesPer: "X times per period",
  every: "Every N periods",
}

export const PERIOD_LABELS: Record<(typeof PERIODS)[number], string> = {
  day: "day",
  week: "week",
  month: "month",
  year: "year",
}

export const PERIOD_PLURAL_LABELS: Record<(typeof PERIODS)[number], string> = {
  day: "days",
  week: "weeks",
  month: "months",
  year: "years",
}
