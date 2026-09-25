import type { ReactNode } from "react"
import { CalendarDays, CalendarRange, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import type { Totals } from "@/lib/calculations"

type SummaryProps = {
  totals: Totals
}

export function Summary({ totals }: SummaryProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <SummaryCard
        icon={Wallet}
        title="Total per month"
        description="All items together"
        value={totals.totalMonthly}
      />
      <SummaryCard
        icon={CalendarRange}
        title="Weekly rate"
        description="Average per week"
        value={totals.weeklyRate}
      />
      <SummaryCard
        icon={CalendarDays}
        title="Daily rate"
        description="Average per day"
        value={totals.dailyRate}
      />
    </div>
  )
}

type SummaryCardProps = {
  icon: LucideIcon
  title: string
  description: string
  value: number
  /** Shown in the top right of the card, e.g. an edit button. */
  action?: ReactNode
  valueClassName?: string
  /** Replaces the value, e.g. with an input while editing. */
  children?: ReactNode
}

export function SummaryCard({
  icon: Icon,
  title,
  description,
  value,
  action,
  valueClassName,
  children,
}: SummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent>
        {children ?? (
          <p
            className={cn(
              "font-heading text-2xl font-semibold tabular-nums",
              valueClassName,
            )}
          >
            {formatCurrency(value)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
