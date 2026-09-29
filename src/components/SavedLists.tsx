import { useState } from "react"
import { FolderOpen, Save, Trash2 } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { calculateTotals } from "@/lib/calculations"
import { formatCurrency } from "@/lib/format"
import { loadSavedLists, saveSavedLists } from "@/lib/storage"
import type { Item, SavedList } from "@/types"

type SavedListsProps = {
  items: Item[]
  income: number
  onLoad: (list: SavedList) => void
}

/** A confirmation the user still has to agree to. */
type Pending =
  | { type: "overwrite"; name: string; existing: SavedList }
  | { type: "load"; list: SavedList }
  | { type: "delete"; list: SavedList }

export function SavedLists({ items, income, onLoad }: SavedListsProps) {
  const [lists, setLists] = useState<SavedList[]>(() => loadSavedLists())
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<Pending | null>(null)

  const commit = (next: SavedList[]) => {
    setLists(next)
    saveSavedLists(next)
  }

  const store = (listName: string, replacing?: SavedList) => {
    const saved: SavedList = {
      id: replacing?.id ?? crypto.randomUUID(),
      name: listName,
      savedAt: new Date().toISOString(),
      items,
      income,
    }

    commit(
      replacing
        ? lists.map((list) => (list.id === replacing.id ? saved : list))
        : [...lists, saved],
    )
    setName("")
    setError(null)
  }

  const handleSave = () => {
    const trimmed = name.trim()
    if (trimmed.length === 0) {
      setError("Give this list a name.")
      return
    }

    const existing = lists.find(
      (list) => list.name.toLowerCase() === trimmed.toLowerCase(),
    )
    if (existing) {
      setPending({ type: "overwrite", name: trimmed, existing })
      return
    }

    store(trimmed)
  }

  const handleLoad = (list: SavedList) => {
    // Nothing to lose when the list is empty, so skip the question.
    if (items.length === 0) {
      onLoad(list)
      return
    }
    setPending({ type: "load", list })
  }

  const confirmPending = () => {
    if (!pending) return

    if (pending.type === "overwrite") store(pending.name, pending.existing)
    if (pending.type === "load") onLoad(pending.list)
    if (pending.type === "delete") {
      commit(lists.filter((list) => list.id !== pending.list.id))
    }

    setPending(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved lists</CardTitle>
        <CardDescription>
          Save everything you have added under a name, and load it back whenever
          you want.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            handleSave()
          }}
        >
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="list-name">List name</FieldLabel>
            <div className="flex items-start gap-2">
              <Input
                id="list-name"
                placeholder="My usual month"
                autoComplete="off"
                aria-invalid={Boolean(error)}
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  if (error) setError(null)
                }}
              />
              <Button type="submit">
                <Save /> Save
              </Button>
            </div>
            <FieldError>{error}</FieldError>
          </Field>
        </form>

        {lists.length === 0 ? (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyTitle>Nothing saved yet</EmptyTitle>
              <EmptyDescription>
                Saved lists show up here, on this device.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col">
            {lists.map((list, index) => (
              <li key={list.id}>
                {index > 0 && <Separator />}
                <div className="flex items-center gap-2 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{list.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">
                        {list.items.length === 1
                          ? "1 item"
                          : `${list.items.length} items`}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(
                          calculateTotals(list.items).totalMonthly,
                        )}{" "}
                        per month
                      </span>
                    </div>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Load ${list.name}`}
                        onClick={() => handleLoad(list)}
                      >
                        <FolderOpen />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Load</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Delete ${list.name}`}
                        onClick={() => setPending({ type: "delete", list })}
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
        )}
      </CardContent>

      <ConfirmPending
        pending={pending}
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
        onConfirm={confirmPending}
      />
    </Card>
  )
}

type ConfirmPendingProps = {
  pending: Pending | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

function ConfirmPending({
  pending,
  onOpenChange,
  onConfirm,
}: ConfirmPendingProps) {
  const [shown, setShown] = useState<Pending | null>(null)

  // Keep the last one on screen while the dialog animates closed.
  if (pending && pending !== shown) setShown(pending)

  const copy = shown ? describe(shown) : null

  return (
    <AlertDialog open={pending !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy?.title}</AlertDialogTitle>
          <AlertDialogDescription>{copy?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={shown?.type === "delete" ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {copy?.action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function describe(pending: Pending) {
  switch (pending.type) {
    case "overwrite":
      return {
        title: `Replace "${pending.name}"?`,
        description:
          "A saved list with that name already exists. It will be replaced by what you have now.",
        action: "Replace",
      }
    case "load":
      return {
        title: `Load "${pending.list.name}"?`,
        description:
          "This replaces the items and income you have now. Save them first if you want to keep them.",
        action: "Load",
      }
    case "delete":
      return {
        title: `Delete "${pending.list.name}"?`,
        description: "This can't be undone.",
        action: "Delete",
      }
  }
}
