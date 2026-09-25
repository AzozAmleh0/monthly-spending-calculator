import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { formatCurrency, frequencyLabel } from "@/lib/format"
import type { Item } from "@/types"

type ItemsListProps = {
  items: Item[]
  editingId: string | null
  onEdit: (item: Item) => void
  onRequestDelete: (item: Item) => void
}

export function ItemsList({
  items,
  editingId,
  onEdit,
  onRequestDelete,
}: ItemsListProps) {
  if (items.length === 0) {
    return (
      <Empty className="py-8">
        <EmptyHeader>
          <EmptyTitle>No items yet</EmptyTitle>
          <EmptyDescription>Add your first expense above.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ul className="flex flex-col">
      {items.map((item, index) => (
        <li key={item.id}>
          {index > 0 && <Separator />}
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-2",
              item.id === editingId && "bg-muted ring-1 ring-foreground/10",
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(item.price)}
                </span>
                <Badge variant="secondary">{frequencyLabel(item.frequency)}</Badge>
              </div>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Edit ${item.name}`}
                  onClick={() => onEdit(item)}
                >
                  <Pencil />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete ${item.name}`}
                  onClick={() => onRequestDelete(item)}
                >
                  <Trash2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </li>
      ))}
    </ul>
  )
}
