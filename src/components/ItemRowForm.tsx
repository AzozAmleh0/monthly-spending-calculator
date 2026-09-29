import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
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

type ItemRowFormProps = {
  item: Item
  onSubmit: (draft: ItemDraft) => void
  onCancel: () => void
  onToggle: (id: string, enabled: boolean) => void
}

/**
 * The editing state of a row in the items list: the same layout as the row it
 * replaces, with the name, price and frequency turned into fields.
 */
export function ItemRowForm({
  item,
  onSubmit,
  onCancel,
  onToggle,
}: ItemRowFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: toFormValues(item),
    mode: "onSubmit",
  })

  const frequencyType = watch("frequencyType")
  const period = watch("period")

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(toItemDraft(values)))}
      className="my-1 flex items-start gap-2 rounded-lg bg-muted p-2 ring-1 ring-foreground/10"
    >
      <Switch
        className="mt-2"
        checked={item.enabled}
        aria-label={`Count ${item.name} in the totals`}
        onCheckedChange={(checked) => onToggle(item.id, checked)}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Input
          className="bg-background"
          placeholder="Item name"
          autoComplete="off"
          aria-label="Item name"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="w-24 bg-background"
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            placeholder="₪"
            autoComplete="off"
            aria-label="Price in ₪"
            aria-invalid={Boolean(errors.price)}
            {...register("price")}
          />

          <Select
            value={frequencyType}
            onValueChange={(value) =>
              setValue("frequencyType", value as ItemFormValues["frequencyType"])
            }
          >
            <SelectTrigger className="w-40 bg-background" aria-label="Frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {FREQUENCY_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* The count, the wording and the period wrap as one group. */}
          {frequencyType === "timesPer" && (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Input
                className="w-16 bg-background"
                type="number"
                inputMode="numeric"
                step="1"
                min="1"
                autoComplete="off"
                aria-label="Times per period"
                aria-invalid={Boolean(errors.times)}
                {...register("times")}
              />
              <span className="text-sm text-muted-foreground">times per</span>
              <PeriodSelect
                value={period}
                labels={PERIOD_LABELS}
                onChange={(value) => setValue("period", value)}
              />
            </div>
          )}

          {frequencyType === "every" && (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-sm text-muted-foreground">every</span>
              <Input
                className="w-16 bg-background"
                type="number"
                inputMode="numeric"
                step="1"
                min="1"
                autoComplete="off"
                aria-label="Number of periods"
                aria-invalid={Boolean(errors.interval)}
                {...register("interval")}
              />
              <PeriodSelect
                value={period}
                labels={PERIOD_PLURAL_LABELS}
                onChange={(value) => setValue("period", value)}
              />
            </div>
          )}
        </div>

        <FieldError
          errors={[errors.name, errors.price, errors.times, errors.interval]}
        />
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="submit" size="icon" aria-label="Save changes">
            <Check />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Save changes</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Cancel"
            onClick={onCancel}
          >
            <X />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Cancel</TooltipContent>
      </Tooltip>
    </form>
  )
}

type PeriodSelectProps = {
  value: ItemFormValues["period"]
  labels: Record<(typeof PERIODS)[number], string>
  onChange: (value: ItemFormValues["period"]) => void
}

function PeriodSelect({ value, labels, onChange }: PeriodSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as ItemFormValues["period"])}
    >
      <SelectTrigger className="w-28 bg-background" aria-label="Period">
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
