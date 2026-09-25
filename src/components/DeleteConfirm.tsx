import { useEffect, useState } from "react"

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
import type { Item } from "@/types"

type DeleteConfirmProps = {
  item: Item | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteConfirm({
  item,
  onOpenChange,
  onConfirm,
}: DeleteConfirmProps) {
  // Remembering the name keeps the title readable while the dialog closes.
  const [name, setName] = useState("")

  useEffect(() => {
    if (item) setName(item.name)
  }, [item])

  return (
    <AlertDialog open={item !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
