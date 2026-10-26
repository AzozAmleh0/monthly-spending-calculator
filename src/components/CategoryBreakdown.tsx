import { useMemo } from "react"

import { CategoryDot } from "@/components/CategoryPicker"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { monthlyCost } from "@/lib/calculations"
import { formatCurrency, frequencyLabel } from "@/lib/format"
import type { Category, Item } from "@/types"

type CategoryBreakdownProps = {
  items: Item[]
  categories: Category[]
  totalMonthly: number
}

type Group = {
  /** "none" for the items without a category. */
  key: string
  category: Category | null
  items: Item[]
  monthly: number
}

const percentFormatter = new Intl.NumberFormat("en-IL", {
  style: "percent",
  maximumFractionDigits: 0,
})

export function CategoryBreakdown({
  items,
  categories,
  totalMonthly,
}: CategoryBreakdownProps) {
  const groups = useMemo(() => {
    const toGroup = (category: Category | null, members: Item[]): Group => ({
      key: category?.id ?? "none",
      category,
      // Most expensive first inside each category.
      items: [...members].sort((a, b) => monthlyCost(b) - monthlyCost(a)),
      monthly: members.reduce((sum, item) => sum + monthlyCost(item), 0),
    })

    const byCategory = categories
      .map((category) =>
        toGroup(
          category,
          items.filter((item) => item.categoryId === category.id),
        ),
      )
      .filter((group) => group.items.length > 0)
      .sort((a, b) => b.monthly - a.monthly)

    const uncategorized = items.filter((item) => item.categoryId === null)

    // Items without a category always come last.
    return uncategorized.length > 0
      ? [...byCategory, toGroup(null, uncategorized)]
      : byCategory
  }, [items, categories])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly cost per category</CardTitle>
        <CardDescription>
          Open a category to see the expenses in it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyTitle>No items yet</EmptyTitle>
              <EmptyDescription>
                Add an expense with a category to see it here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Accordion type="multiple">
            {groups.map((group) => (
              <AccordionItem key={group.key} value={group.key}>
                <AccordionTrigger className="items-center gap-3 hover:no-underline">
                  {group.category ? (
                    <CategoryDot color={group.category.color} />
                  ) : (
                    <CategoryDot color="slate" className="opacity-30" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">
                      {group.category?.name ?? "No category"}
                    </span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {group.items.length === 1
                        ? "1 item"
                        : `${group.items.length} items`}
                      {totalMonthly > 0 &&
                        ` · ${percentFormatter.format(group.monthly / totalMonthly)} of the total`}
                    </span>
                  </span>
                  <span className="tabular-nums">
                    {formatCurrency(group.monthly)}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableBody>
                      {group.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="break-words whitespace-normal">
                            {item.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-normal">
                            {frequencyLabel(item.frequency)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(monthlyCost(item))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}
