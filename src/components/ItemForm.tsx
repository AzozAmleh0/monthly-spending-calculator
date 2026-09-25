import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil, Plus } from "lucide-react"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  emptyFormValues,
  FREQUENCY_TYPE_LABELS,
  FREQUENCY_TYPES,
  itemFormSchema,
  PERIOD_LABELS,
  PERIOD_PLURAL_LABELS,
  PERIODS,
  toFormValues,
  toItemDraft,
  type ItemFormValues,
} from "@/lib/schema"
import type { Item, ItemDraft } from "@/types"

type ItemFormProps = {
  editingItem: Item | null
  onAdd: (draft: ItemDraft) => void
  onSave: (id: string, draft: ItemDraft) => void
  onCancelEdit: () => void
}

export function ItemForm({
  editingItem,
  onAdd,
  onSave,
  onCancelEdit,
}: ItemFormProps) {
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: emptyFormValues,
    mode: "onSubmit",
  })

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = form

  // Load the edited item into the form, or clear it when edit mode ends.
  useEffect(() => {
    reset(editingItem ? toFormValues(editingItem) : emptyFormValues)
  }, [editingItem, reset])

  const frequencyType = watch("frequencyType")
  const period = watch("period")
  const isEditing = editingItem !== null

  const submit = handleSubmit((values) => {
    const draft = toItemDraft(values)

    if (editingItem) {
      onSave(editingItem.id, draft)
      return
    }

    onAdd(draft)
    reset(emptyFormValues)
  })

  return (
    <form onSubmit={submit} noValidate>
      <FieldGroup>
        {isEditing && (
          <Alert>
            <Pencil />
            <AlertTitle>Editing: {editingItem.name}</AlertTitle>
          </Alert>
        )}

        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="item-name">Item name</FieldLabel>
          <Input
            id="item-name"
            placeholder="Cigarettes"
            autoComplete="off"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={Boolean(errors.price)}>
          <FieldLabel htmlFor="item-price">Price (₪)</FieldLabel>
          <Input
            id="item-price"
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            placeholder="35"
            autoComplete="off"
            aria-invalid={Boolean(errors.price)}
            {...register("price")}
          />
          <FieldError errors={[errors.price]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="item-frequency">Frequency</FieldLabel>
          <Select
            value={frequencyType}
            onValueChange={(value) =>
              setValue("frequencyType", value as ItemFormValues["frequencyType"], {
                shouldValidate: false,
              })
            }
          >
            <SelectTrigger id="item-frequency" className="w-full">
              <SelectValue placeholder="Choose a frequency" />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {FREQUENCY_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {frequencyType === "timesPer" && (
          <Field data-invalid={Boolean(errors.times)}>
            <FieldLabel htmlFor="item-times">Times per period</FieldLabel>
            <div className="flex items-start gap-2">
              <Input
                id="item-times"
                type="number"
                inputMode="numeric"
                step="1"
                min="1"
                className="w-24"
                autoComplete="off"
                aria-invalid={Boolean(errors.times)}
                {...register("times")}
              />
              <span className="pt-1.5 text-sm text-muted-foreground">
                times per
              </span>
              <PeriodSelect
                id="item-times-period"
                value={period}
                onChange={(value) => setValue("period", value)}
                labels={PERIOD_LABELS}
              />
            </div>
            <FieldError errors={[errors.times]} />
          </Field>
        )}

        {frequencyType === "every" && (
          <Field data-invalid={Boolean(errors.interval)}>
            <FieldLabel htmlFor="item-interval">Every N periods</FieldLabel>
            <div className="flex items-start gap-2">
              <span className="pt-1.5 text-sm text-muted-foreground">every</span>
              <Input
                id="item-interval"
                type="number"
                inputMode="numeric"
                step="1"
                min="1"
                className="w-24"
                autoComplete="off"
                aria-invalid={Boolean(errors.interval)}
                {...register("interval")}
              />
              <PeriodSelect
                id="item-interval-period"
                value={period}
                onChange={(value) => setValue("period", value)}
                labels={PERIOD_PLURAL_LABELS}
              />
            </div>
            <FieldError errors={[errors.interval]} />
          </Field>
        )}

        <Field orientation="horizontal">
          <Button type="submit">
            {isEditing ? "Save changes" : (
              <>
                <Plus /> Add
              </>
            )}
          </Button>
          {isEditing && (
            <Button type="button" variant="outline" onClick={onCancelEdit}>
              Cancel
            </Button>
          )}
        </Field>
      </FieldGroup>
    </form>
  )
}

type PeriodSelectProps = {
  id: string
  value: ItemFormValues["period"]
  onChange: (value: ItemFormValues["period"]) => void
  labels: Record<(typeof PERIODS)[number], string>
}

function PeriodSelect({ id, value, onChange, labels }: PeriodSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as ItemFormValues["period"])}
    >
      <SelectTrigger id={id} className="flex-1">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PERIODS.map((item) => (
          <SelectItem key={item} value={item}>
            {labels[item]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
