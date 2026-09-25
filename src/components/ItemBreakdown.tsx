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
import { monthlyCost } from "@/lib/calculations"
import { formatCurrency, frequencyLabel } from "@/lib/format"
import type { Item } from "@/types"

type ItemBreakdownProps = {
  items: Item[]
  totalMonthly: number
}

export function ItemBreakdown({ items, totalMonthly }: ItemBreakdownProps) {
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
                <TableHead>Item</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead className="text-right">Per month</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
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
