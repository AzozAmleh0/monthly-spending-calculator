import { useMemo, useState } from "react"

import { DeleteConfirm } from "@/components/DeleteConfirm"
import { ItemBreakdown } from "@/components/ItemBreakdown"
import { ItemForm } from "@/components/ItemForm"
import { ItemsList } from "@/components/ItemsList"
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
import { loadItems, saveItems } from "@/lib/storage"
import type { Item, ItemDraft } from "@/types"

export default function App() {
  const [items, setItems] = useState<Item[]>(() => loadItems())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null)

  const editingItem = items.find((item) => item.id === editingId) ?? null
  const totals = useMemo(() => calculateTotals(items), [items])

  /** Every change to the list is mirrored to localStorage right away. */
  const commit = (next: Item[]) => {
    setItems(next)
    saveItems(next)
  }

  const handleAdd = (draft: ItemDraft) => {
    commit([...items, { id: crypto.randomUUID(), ...draft }])
  }

  const handleSave = (id: string, draft: ItemDraft) => {
    commit(items.map((item) => (item.id === id ? { ...item, ...draft } : item)))
    setEditingId(null)
  }

  const handleDelete = () => {
    if (!itemToDelete) return

    commit(items.filter((item) => item.id !== itemToDelete.id))
    if (editingId === itemToDelete.id) {
      setEditingId(null)
    }
    setItemToDelete(null)
  }

  return (
    <TooltipProvider>
      <div className="mx-auto w-full max-w-6xl px-4 pb-10">
        <header className="py-6">
          <h1 className="font-heading text-2xl font-semibold">
            Monthly Spending Calculator
          </h1>
          <p className="text-sm text-muted-foreground">
            Add your recurring expenses and see what they cost you every month.
          </p>
        </header>

        <div className="grid items-start gap-6 md:grid-cols-2">
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
                  editingItem={editingItem}
                  onAdd={handleAdd}
                  onSave={handleSave}
                  onCancelEdit={() => setEditingId(null)}
                />
              </CardContent>
            </Card>

            <Card className="md:flex md:min-h-0 md:flex-1">
              <CardHeader>
                <CardTitle>Your items</CardTitle>
                <CardDescription>
                  {items.length === 1 ? "1 item" : `${items.length} items`}
                </CardDescription>
              </CardHeader>
              <CardContent className="md:min-h-0 md:flex-1">
                <ScrollArea className="md:h-full">
                  <ItemsList
                    items={items}
                    editingId={editingId}
                    onEdit={(item) => setEditingId(item.id)}
                    onRequestDelete={setItemToDelete}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right: calculations. Scrolls with the page. */}
          <div className="flex flex-col gap-6 md:py-6">
            <Summary totals={totals} />
            <ItemBreakdown items={items} totalMonthly={totals.totalMonthly} />
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
