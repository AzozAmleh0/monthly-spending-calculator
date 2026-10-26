import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"

import { CategoryBadge } from "@/components/CategoryPicker"
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
import { cn } from "@/lib/utils"
import type { Category, Item } from "@/types"

type SortColumn = "name" | "category" | "frequency" | "monthly"
type SortDirection = "asc" | "desc"
type Sort = { column: SortColumn; direction: SortDirection }

type ItemBreakdownProps = {
  items: Item[]
  categories: Category[]
  totalMonthly: number
}

export function ItemBreakdown({
  items,
  categories,
  totalMonthly,
}: ItemBreakdownProps) {
  // No sort means the order the items were added in.
  const [sort, setSort] = useState<Sort | null>(null)

  const categoryOf = useMemo(() => {
    const byId = new Map(categories.map((category) => [category.id, category]))
    return (item: Item) => (item.categoryId ? byId.get(item.categoryId) : undefined)
  }, [categories])

  const sorted = useMemo(() => {
    if (!sort) return items

    const factor = sort.direction === "asc" ? 1 : -1

    return [...items].sort((a, b) => {
      switch (sort.column) {
        case "name":
          return factor * a.name.localeCompare(b.name)
        case "category": {
          const nameA = categoryOf(a)?.name
          const nameB = categoryOf(b)?.name
          // Items without a category stay last in both directions.
          if (nameA === nameB) return 0
          if (nameA === undefined) return 1
          if (nameB === undefined) return -1
          return factor * nameA.localeCompare(nameB, undefined, { sensitivity: "base" })
        }
        case "frequency":
          // How often it is paid, not the label text: yearly before daily.
          return (
            factor * (occurrencesPerYear(a.frequency) - occurrencesPerYear(b.frequency))
          )
        case "monthly":
          return factor * (monthlyCost(a) - monthlyCost(b))
      }
    })
  }, [items, sort, categoryOf])

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
      {/* A container, so the table can react to the card's width. */}
      <CardContent className="@container">
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
                  column="category"
                  sort={sort}
                  onSort={toggleSort}
                  label="Category"
                  className="hidden @min-[26rem]:table-cell"
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
              {sorted.map((item) => {
                const category = categoryOf(item)

                return (
                  <TableRow key={item.id}>
                    {/* The text columns wrap so a long name cannot push the
                        table wider than its card. */}
                    <TableCell className="font-medium break-words whitespace-normal">
                      {item.name}
                      {/* In a narrow card the category sits under the name
                          instead of taking a column of its own. */}
                      {category && (
                        <CategoryBadge category={category} className="mt-1 flex @min-[26rem]:hidden" />
                      )}
                    </TableCell>
                    <TableCell className="hidden @min-[26rem]:table-cell">
                      {category ? (
                        <CategoryBadge category={category} />
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-normal">
                      {frequencyLabel(item.frequency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(monthlyCost(item))}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>Total per month</TableCell>
                {/* Fills the extra column only when the category column shows. */}
                <TableCell className="hidden @min-[26rem]:table-cell" />
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
  className?: string
}

function SortableHead({
  column,
  label,
  sort,
  onSort,
  align = "left",
  className,
}: SortableHeadProps) {
  const active = sort?.column === column
  const Icon = !active ? ChevronsUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown

  return (
    <TableHead
      // No right padding on this one: the button sits flush with the table's
      // edge instead of spilling past it and forcing a scrollbar.
      className={cn(align === "right" && "pr-0 text-right", className)}
      aria-sort={
        active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <Button
        variant="ghost"
        size="sm"
        className={align === "right" ? "ml-auto" : "-ml-2.5"}
        onClick={() => onSort(column)}
      >
        {label}
        <Icon className={active ? undefined : "opacity-50"} />
      </Button>
    </TableHead>
  )
}
