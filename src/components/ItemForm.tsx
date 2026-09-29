import { useId } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"

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
  toItemDraft,
  type ItemFormValues,
} from "@/lib/schema"
import type { ItemDraft } from "@/types"

type ItemFormProps = {
  onSubmit: (draft: ItemDraft) => void
}

/** Adds a new item. Editing one happens in its own row, in ItemRowForm. */
export function ItemForm({ onSubmit }: ItemFormProps) {
  // An edit form can be open at the same time, so ids have to be unique.
  const uid = useId()

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: emptyFormValues,
    mode: "onSubmit",
  })

  const frequencyType = watch("frequencyType")
  const period = watch("period")

  const submit = handleSubmit((values) => {
    onSubmit(toItemDraft(values))
    reset(emptyFormValues)
  })

  return (
    <form onSubmit={submit} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor={`${uid}-name`}>Item name</FieldLabel>
          <Input
            id={`${uid}-name`}
            placeholder="Cigarettes"
            autoComplete="off"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={Boolean(errors.price)}>
          <FieldLabel htmlFor={`${uid}-price`}>Price (₪)</FieldLabel>
          <Input
            id={`${uid}-price`}
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
          <FieldLabel htmlFor={`${uid}-frequency`}>Frequency</FieldLabel>
          <Select
            value={frequencyType}
            onValueChange={(value) =>
              setValue("frequencyType", value as ItemFormValues["frequencyType"], {
                shouldValidate: false,
              })
            }
          >
            <SelectTrigger id={`${uid}-frequency`} className="w-full">
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
            <FieldLabel htmlFor={`${uid}-times`}>Times per period</FieldLabel>
            <div className="flex items-start gap-2">
              <Input
                id={`${uid}-times`}
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
                id={`${uid}-times-period`}
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
            <FieldLabel htmlFor={`${uid}-interval`}>Every N periods</FieldLabel>
            <div className="flex items-start gap-2">
              <span className="pt-1.5 text-sm text-muted-foreground">every</span>
              <Input
                id={`${uid}-interval`}
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
                id={`${uid}-interval-period`}
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
            <Plus /> Add
          </Button>
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
