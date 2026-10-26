import type { Category, CategoryColor, Item } from "@/types"

export const CATEGORY_COLORS = [
  "red",
  "orange",
  "amber",
  "green",
  "teal",
  "sky",
  "blue",
  "violet",
  "pink",
  "slate",
] as const satisfies readonly CategoryColor[]

export const CATEGORY_COLOR_LABELS: Record<CategoryColor, string> = {
  red: "Red",
  orange: "Orange",
  amber: "Amber",
  green: "Green",
  teal: "Teal",
  sky: "Sky",
  blue: "Blue",
  violet: "Violet",
  pink: "Pink",
  slate: "Slate",
}

/** Written out in full so Tailwind finds every class. */
export const CATEGORY_DOT_CLASSES: Record<CategoryColor, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  amber: "bg-amber-500",
  green: "bg-green-500",
  teal: "bg-teal-500",
  sky: "bg-sky-500",
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  pink: "bg-pink-500",
  slate: "bg-slate-500",
}

export function isCategoryColor(value: unknown): value is CategoryColor {
  return (
    typeof value === "string" &&
    CATEGORY_COLORS.includes(value as CategoryColor)
  )
}

/** The first color no category uses yet, so new ones look different. */
export function nextCategoryColor(categories: Category[]): CategoryColor {
  const used = new Set(categories.map((category) => category.color))
  return (
    CATEGORY_COLORS.find((color) => !used.has(color)) ??
    CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length]
  )
}

export function findCategoryByName(
  categories: Category[],
  name: string,
): Category | undefined {
  const wanted = name.trim().toLowerCase()
  return categories.find((category) => category.name.toLowerCase() === wanted)
}

/**
 * Adds a saved list's categories to the current ones. A category that already
 * exists (same id, or same name) keeps its current name and color, and the
 * items are pointed at it.
 */
export function mergeCategories(
  current: Category[],
  incoming: Category[],
  items: Item[],
): { categories: Category[]; items: Item[] } {
  const categories = [...current]
  const idMap = new Map<string, string>()

  for (const category of incoming) {
    if (categories.some((existing) => existing.id === category.id)) continue

    const sameName = findCategoryByName(categories, category.name)
    if (sameName) {
      idMap.set(category.id, sameName.id)
    } else {
      categories.push(category)
    }
  }

  const ids = new Set(categories.map((category) => category.id))

  return {
    categories,
    items: items.map((item) => {
      const categoryId = item.categoryId
        ? (idMap.get(item.categoryId) ?? item.categoryId)
        : null
      return { ...item, categoryId: categoryId && ids.has(categoryId) ? categoryId : null }
    }),
  }
}
