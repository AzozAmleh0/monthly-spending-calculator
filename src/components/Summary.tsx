import { CalendarDays, CalendarRange, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
        icon={CalendarDays}
        title="Daily rate"
        description="Average per day"
        value={totals.dailyRate}
      />
      <SummaryCard
        icon={CalendarRange}
        title="Weekly rate"
        description="Average per week"
        value={totals.weeklyRate}
      />
    </div>
  )
}

type SummaryCardProps = {
  icon: LucideIcon
  title: string
  description: string
  value: number
}

function SummaryCard({ icon: Icon, title, description, value }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="font-heading text-2xl font-semibold tabular-nums">
          {formatCurrency(value)}
        </p>
      </CardContent>
    </Card>
  )
}
