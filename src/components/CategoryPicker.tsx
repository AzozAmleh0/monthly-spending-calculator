import { useState } from "react"
import { ChevronsUpDown, Pencil, Plus, Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  CATEGORY_COLOR_LABELS,
  CATEGORY_COLORS,
  CATEGORY_DOT_CLASSES,
  findCategoryByName,
} from "@/lib/categories"
import { cn } from "@/lib/utils"
import type { Category, CategoryColor } from "@/types"

/** What the picker can do to the category list. The app owns the list. */
export type CategoryActions = {
  onCreate: (name: string) => Category
  onUpdate: (id: string, changes: Pick<Category, "name" | "color">) => void
  onDelete: (id: string) => void
}

type CategoryPickerProps = CategoryActions & {
  categories: Category[]
  /** Empty means no category. */
  value: string
  onChange: (categoryId: string) => void
  id?: string
  /** For places with no visible label, like the row being edited. */
  "aria-label"?: string
  className?: string
}

type Editing = { category: Category; name: string; color: CategoryColor }

/**
 * Picks an item's category. Typing a name that does not exist offers to
 * create it, and every category can be renamed, recolored or deleted from
 * the same list.
 */
export function CategoryPicker({
  categories,
  value,
  onChange,
  onCreate,
  onUpdate,
  onDelete,
  id,
  "aria-label": ariaLabel,
  className,
}: CategoryPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<Editing | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<Category | null>(null)

  const selected = categories.find((category) => category.id === value)
  const trimmed = search.trim()
  const canCreate = trimmed.length > 0 && !findCategoryByName(categories, trimmed)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setSearch("")
      setEditing(null)
      setEditError(null)
    }
  }

  const choose = (categoryId: string) => {
    onChange(categoryId)
    handleOpenChange(false)
  }

  const create = () => {
    if (!canCreate) return
    choose(onCreate(trimmed).id)
  }

  const startEditing = (category: Category) => {
    setEditing({ category, name: category.name, color: category.color })
    setEditError(null)
  }

  const saveEditing = () => {
    if (!editing) return

    const name = editing.name.trim()
    if (name.length === 0) {
      setEditError("Give the category a name.")
      return
    }
    const sameName = findCategoryByName(categories, name)
    if (sameName && sameName.id !== editing.category.id) {
      setEditError("Another category already has this name.")
      return
    }

    onUpdate(editing.category.id, { name, color: editing.color })
    setEditing(null)
    setEditError(null)
  }

  const confirmDelete = () => {
    if (!toDelete) return
    onDelete(toDelete.id)
    if (value === toDelete.id) onChange("")
    setToDelete(null)
  }

  return (
    <>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={ariaLabel}
            className={cn("justify-between font-normal", className)}
          >
            {selected ? (
              <span className="flex min-w-0 items-center gap-2">
                <CategoryDot color={selected.color} />
                <span className="truncate">{selected.name}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">No category</span>
            )}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) min-w-72 p-0"
        >
          {editing ? (
            // Not a <form>: the picker sits inside the item forms, and a
            // submit here would bubble up to them through the portal.
            <div className="flex flex-col gap-4 p-3">
              <Field data-invalid={Boolean(editError)}>
                <FieldLabel htmlFor="category-edit-name">Category name</FieldLabel>
                <Input
                  id="category-edit-name"
                  autoFocus
                  autoComplete="off"
                  aria-invalid={Boolean(editError)}
                  value={editing.name}
                  onChange={(event) => {
                    setEditing({ ...editing, name: event.target.value })
                    if (editError) setEditError(null)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      saveEditing()
                    }
                  }}
                />
                <FieldError>{editError}</FieldError>
              </Field>

              <Field>
                <FieldLabel id="category-edit-color">Color</FieldLabel>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  size="sm"
                  spacing={1}
                  className="flex-wrap"
                  aria-labelledby="category-edit-color"
                  value={editing.color}
                  onValueChange={(color) => {
                    // Clicking the chosen color again would clear it.
                    if (color) setEditing({ ...editing, color: color as CategoryColor })
                  }}
                >
                  {CATEGORY_COLORS.map((color) => (
                    <ToggleGroupItem
                      key={color}
                      value={color}
                      aria-label={CATEGORY_COLOR_LABELS[color]}
                      title={CATEGORY_COLOR_LABELS[color]}
                    >
                      <CategoryDot color={color} />
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </Field>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditing(null)
                    setEditError(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={saveEditing}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <Command>
              <CommandInput
                placeholder="Search or create a category"
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                {/* While typing a new name the create option is always there. */}
                {!canCreate && <CommandEmpty>No matching category.</CommandEmpty>}
                <CommandGroup>
                  <CommandItem
                    value="No category"
                    data-checked={value === ""}
                    onSelect={() => choose("")}
                  >
                    <span className="text-muted-foreground">No category</span>
                  </CommandItem>
                  {categories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      data-checked={value === category.id}
                      onSelect={() => choose(category.id)}
                    >
                      <CategoryDot color={category.color} />
                      <span className="min-w-0 flex-1 truncate">{category.name}</span>
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        aria-label={`Edit ${category.name}`}
                        title="Rename or recolor"
                        onClick={(event) => {
                          event.stopPropagation()
                          startEditing(category)
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        aria-label={`Delete ${category.name}`}
                        title="Delete"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleOpenChange(false)
                          setToDelete(category)
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </CommandItem>
                  ))}
                </CommandGroup>

                {canCreate && (
                  <>
                    <CommandSeparator alwaysRender />
                    {/* Shown whatever the filter says, or cmdk would hide it. */}
                    <CommandGroup forceMount>
                      <CommandItem forceMount value={`create ${trimmed}`} onSelect={create}>
                        <Plus />
                        <span className="truncate">Create "{trimmed}"</span>
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>

      <AlertDialog
        open={toDelete !== null}
        onOpenChange={(next) => {
          if (!next) setToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{toDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Its items stay in your list with no category. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/** The small colored circle that stands for a category everywhere. */
export function CategoryDot({
  color,
  className,
}: {
  color: CategoryColor
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn("size-2.5 shrink-0 rounded-full", CATEGORY_DOT_CLASSES[color], className)}
    />
  )
}
