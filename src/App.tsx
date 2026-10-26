import { useMemo, useState } from "react"

import { Balance } from "@/components/Balance"
import { CategoryBreakdown } from "@/components/CategoryBreakdown"
import type { CategoryActions } from "@/components/CategoryPicker"
import { DeleteConfirm } from "@/components/DeleteConfirm"
import { ItemBreakdown } from "@/components/ItemBreakdown"
import { ItemForm } from "@/components/ItemForm"
import { ItemsList } from "@/components/ItemsList"
import { SavedLists } from "@/components/SavedLists"
import { Summary } from "@/components/Summary"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TooltipProvider } from "@/components/ui/tooltip"
import { calculateTotals } from "@/lib/calculations"
import { mergeCategories, nextCategoryColor } from "@/lib/categories"
import { loadState, saveState } from "@/lib/storage"
import type { StoredState } from "@/lib/storage"
import type { Category, Item, ItemDraft, SavedList } from "@/types"

export default function App() {
  const [state, setState] = useState(() => loadState())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null)

  const { items, income, categories } = state

  // Switched-off items stay in the list but are left out of every total.
  const activeItems = useMemo(() => items.filter((item) => item.enabled), [items])
  const totals = useMemo(() => calculateTotals(activeItems), [activeItems])
  const offCount = items.length - activeItems.length

  /** Every change is mirrored to localStorage right away. */
  const commit = (next: Partial<StoredState>) => {
    const merged = { ...state, ...next }
    setState(merged)
    saveState(merged)
  }

  const commitItems = (nextItems: Item[]) => commit({ items: nextItems })

  /** A form can still hold a category that was deleted while it was open. */
  const withKnownCategory = (draft: ItemDraft): ItemDraft =>
    draft.categoryId && !categories.some((category) => category.id === draft.categoryId)
      ? { ...draft, categoryId: null }
      : draft

  const handleAdd = (draft: ItemDraft) => {
    commitItems([
      ...items,
      { id: crypto.randomUUID(), enabled: true, ...withKnownCategory(draft) },
    ])
  }

  const handleSave = (id: string, draft: ItemDraft) => {
    commitItems(
      items.map((item) =>
        item.id === id ? { ...item, ...withKnownCategory(draft) } : item,
      ),
    )
    setEditingId(null)
  }

  const categoryActions: CategoryActions = {
    onCreate: (name) => {
      const category: Category = {
        id: crypto.randomUUID(),
        name,
        color: nextCategoryColor(categories),
      }
      commit({ categories: [...categories, category] })
      return category
    },
    onUpdate: (id, changes) => {
      commit({
        categories: categories.map((category) =>
          category.id === id ? { ...category, ...changes } : category,
        ),
      })
    },
    // Its items stay, with no category.
    onDelete: (id) => {
      commit({
        categories: categories.filter((category) => category.id !== id),
        items: items.map((item) =>
          item.categoryId === id ? { ...item, categoryId: null } : item,
        ),
      })
    },
  }

  const handleToggle = (id: string, enabled: boolean) => {
    commitItems(
      items.map((item) => (item.id === id ? { ...item, enabled } : item)),
    )
  }

  const handleLoadList = (list: SavedList) => {
    // Categories are kept across lists, so loading one adds any it is missing.
    const merged = mergeCategories(categories, list.categories, list.items)
    commit({ items: merged.items, income: list.income, categories: merged.categories })
    setEditingId(null)
    setItemToDelete(null)
  }

  const handleDelete = () => {
    if (!itemToDelete) return

    commitItems(items.filter((item) => item.id !== itemToDelete.id))
    if (editingId === itemToDelete.id) {
      setEditingId(null)
    }
    setItemToDelete(null)
  }

  return (
    <TooltipProvider>
      <div className="mx-auto w-full max-w-[1250px] px-4 pb-10">
        <header className="py-6">
          <h1 className="font-heading text-2xl font-semibold">
            Monthly Spending Calculator
          </h1>
          <p className="text-sm text-muted-foreground">
            Add your recurring expenses and see what they cost you every month.
          </p>
        </header>

        {/* Even halves on medium screens; from xl the left column is a fixed
            600px and the calculations take the rest, so they get the wider half. */}
        <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-[600px_minmax(0,1fr)]">
          {/* Left: form + items. Sticky on desktop, normal flow on phones. */}
          <div className="flex flex-col gap-6 md:sticky md:top-0 md:h-screen md:overflow-hidden md:py-6">
            <Card>
              <CardHeader>
                <CardTitle>Add an expense</CardTitle>
                <CardDescription>
                  Name it, set the price in ₪, and choose how often you pay.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ItemForm
                  onSubmit={handleAdd}
                  categories={categories}
                  categoryActions={categoryActions}
                />
              </CardContent>
            </Card>

            <Card className="md:flex md:min-h-0 md:flex-1">
              <CardHeader>
                <CardTitle>Your items</CardTitle>
                <CardDescription>
                  {items.length === 1 ? "1 item" : `${items.length} items`}
                  {offCount > 0 && ` · ${offCount} switched off`}
                </CardDescription>
              </CardHeader>
              <CardContent className="md:min-h-0 md:flex-1">
                <ScrollArea className="md:h-full">
                  <ItemsList
                    items={items}
                    categories={categories}
                    categoryActions={categoryActions}
                    editingId={editingId}
                    onEdit={(item) => setEditingId(item.id)}
                    onRequestDelete={setItemToDelete}
                    onToggle={handleToggle}
                    onSaveEdit={handleSave}
                    onCancelEdit={() => setEditingId(null)}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right: calculations. Scrolls with the page. */}
          <div className="flex flex-col gap-6 md:py-6">
            <Summary totals={totals} />
            <Balance
              income={income}
              totalMonthly={totals.totalMonthly}
              onIncomeChange={(next) => commit({ income: next })}
            />
            <CategoryBreakdown
              items={activeItems}
              categories={categories}
              totalMonthly={totals.totalMonthly}
            />
            <ItemBreakdown
              items={activeItems}
              categories={categories}
              totalMonthly={totals.totalMonthly}
            />
            <SavedLists
              items={items}
              income={income}
              categories={categories}
              onLoad={handleLoadList}
            />
          </div>
        </div>
      </div>

      <DeleteConfirm
        item={itemToDelete}
        onOpenChange={(open) => {
          if (!open) setItemToDelete(null)
        }}
        onConfirm={handleDelete}
      />
    </TooltipProvider>
  )
}
