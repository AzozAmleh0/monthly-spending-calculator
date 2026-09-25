import { useEffect, useRef, useState } from "react"
import { Banknote, Check, Pencil, PiggyBank, X } from "lucide-react"

import { SummaryCard } from "@/components/Summary"
import { Button } from "@/components/ui/button"
import { Field, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type BalanceProps = {
  income: number
  totalMonthly: number
  onIncomeChange: (income: number) => void
}

export function Balance({ income, totalMonthly, onIncomeChange }: BalanceProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  const startEditing = () => {
    setDraft(income === 0 ? "" : String(income))
    setError(null)
    setIsEditing(true)
  }

  const cancel = () => {
    setIsEditing(false)
    setError(null)
  }

  const save = () => {
    const value = draft.trim()
    const parsed = value.length === 0 ? 0 : Number(value)

    if (!Number.isFinite(parsed)) {
      setError("Income must be a number.")
      return
    }
    if (parsed < 0) {
      setError("Income can't be negative.")
      return
    }

    onIncomeChange(parsed)
    setIsEditing(false)
    setError(null)
  }

  const left = income - totalMonthly
  // Until an income is set, "left" is just the expenses back to front, so keep
  // that card from reading as a warning.
  const isOverspending = income > 0 && left < 0

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SummaryCard
        icon={Banknote}
        title="Monthly income"
        description="What you get each month"
        value={income}
        action={
          isEditing ? undefined : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Edit monthly income"
                  onClick={startEditing}
                >
                  <Pencil />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit income</TooltipContent>
            </Tooltip>
          )
        }
      >
        {isEditing ? (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              save()
            }}
          >
            <Field data-invalid={Boolean(error)}>
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  placeholder="10000"
                  autoComplete="off"
                  aria-label="Monthly income in ₪"
                  aria-invalid={Boolean(error)}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") cancel()
                  }}
                />
                <Button type="submit" size="icon" aria-label="Save income">
                  <Check />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label="Cancel"
                  onClick={cancel}
                >
                  <X />
                </Button>
              </div>
              <FieldError>{error}</FieldError>
            </Field>
          </form>
        ) : undefined}
      </SummaryCard>

      <SummaryCard
        icon={PiggyBank}
        title="Left after expenses"
        description={
          income === 0
            ? "Set your income to see this"
            : isOverspending
              ? "Your expenses are over your income"
              : "Income minus your monthly total"
        }
        value={left}
        valueClassName={isOverspending ? "text-destructive" : undefined}
      />
    </div>
  )
}
