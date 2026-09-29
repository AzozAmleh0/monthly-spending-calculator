import { Pencil, Trash2 } from "lucide-react"

import { ItemRowForm } from "@/components/ItemRowForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { formatCurrency, frequencyLabel } from "@/lib/format"
import type { Item, ItemDraft } from "@/types"

type ItemsListProps = {
  items: Item[]
  editingId: string | null
  onEdit: (item: Item) => void
  onRequestDelete: (item: Item) => void
  onToggle: (id: string, enabled: boolean) => void
  onSaveEdit: (id: string, draft: ItemDraft) => void
  onCancelEdit: () => void
}

export function ItemsList({
  items,
  editingId,
  onEdit,
  onRequestDelete,
  onToggle,
  onSaveEdit,
  onCancelEdit,
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
      {items.map((item, index) => {
        const isEditing = item.id === editingId

        return (
          <li key={item.id}>
            {index > 0 && <Separator />}

            {isEditing ? (
              // The fields take the place of the row they belong to, and it
              // stays highlighted until the edit is saved or cancelled.
              <ItemRowForm
                key={item.id}
                item={item}
                onSubmit={(draft) => onSaveEdit(item.id, draft)}
                onCancel={onCancelEdit}
                onToggle={onToggle}
              />
            ) : (
              <div className="flex items-center gap-2 rounded-lg px-2 py-2">
                {/* No tooltip here: a tooltip trigger takes over the switch's
                    own data-state, which is what colours it. */}
                <Switch
                  checked={item.enabled}
                  aria-label={`Count ${item.name} in the totals`}
                  onCheckedChange={(checked) => onToggle(item.id, checked)}
                />

                <div className={cn("min-w-0 flex-1", !item.enabled && "opacity-60")}>
                  <p className="truncate font-medium">{item.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)}
                    </span>
                    <Badge variant="secondary">
                      {frequencyLabel(item.frequency)}
                    </Badge>
                    {!item.enabled && <Badge variant="outline">Off</Badge>}
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
            )}
          </li>
        )
      })}
    </ul>
  )
}
