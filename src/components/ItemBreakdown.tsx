import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { monthlyCost, occurrencesPerYear } from "@/lib/calculations"
import { formatCurrency, frequencyLabel } from "@/lib/format"
import type { Item } from "@/types"

type SortColumn = "name" | "frequency" | "monthly"
type SortDirection = "asc" | "desc"
type Sort = { column: SortColumn; direction: SortDirection }

type ItemBreakdownProps = {
  items: Item[]
  totalMonthly: number
}

export function ItemBreakdown({ items, totalMonthly }: ItemBreakdownProps) {
  // No sort means the order the items were added in.
  const [sort, setSort] = useState<Sort | null>(null)

  const sorted = useMemo(() => {
    if (!sort) return items

    const factor = sort.direction === "asc" ? 1 : -1

    return [...items].sort((a, b) => {
      switch (sort.column) {
        case "name":
          return factor * a.name.localeCompare(b.name)
        case "frequency":
          // How often it is paid, not the label text: yearly before daily.
          return (
            factor * (occurrencesPerYear(a.frequency) - occurrencesPerYear(b.frequency))
          )
        case "monthly":
          return factor * (monthlyCost(a) - monthlyCost(b))
      }
    })
  }, [items, sort])

  const toggleSort = (column: SortColumn) => {
    setSort((current) =>
      current?.column === column
        ? { column, direction: current.direction === "asc" ? "desc" : "asc" }
        : { column, direction: "asc" },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly cost per item</CardTitle>
        <CardDescription>
          What each expense costs you over one month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyTitle>No items yet</EmptyTitle>
              <EmptyDescription>
                Add an expense to see its monthly cost.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead
                  column="name"
                  sort={sort}
                  onSort={toggleSort}
                  label="Item"
                />
                <SortableHead
                  column="frequency"
                  sort={sort}
                  onSort={toggleSort}
                  label="Frequency"
                />
                <SortableHead
                  column="monthly"
                  sort={sort}
                  onSort={toggleSort}
                  label="Per month"
                  align="right"
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {frequencyLabel(item.frequency)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(monthlyCost(item))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>Total per month</TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(totalMonthly)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

type SortableHeadProps = {
  column: SortColumn
  label: string
  sort: Sort | null
  onSort: (column: SortColumn) => void
  align?: "left" | "right"
}

function SortableHead({
  column,
  label,
  sort,
  onSort,
  align = "left",
}: SortableHeadProps) {
  const active = sort?.column === column
  const Icon = !active ? ChevronsUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown

  return (
    <TableHead
      className={align === "right" ? "text-right" : undefined}
      aria-sort={
        active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <Button
        variant="ghost"
        size="sm"
        className={align === "right" ? "-mr-2.5 ml-auto" : "-ml-2.5"}
        onClick={() => onSort(column)}
      >
        {label}
        <Icon className={active ? undefined : "opacity-50"} />
      </Button>
    </TableHead>
  )
}
