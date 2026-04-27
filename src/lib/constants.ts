export const ITEM_CATEGORIES = [
  "RAW_MATERIAL",
  "SEMI_FINISHED",
  "FINISHED_GOOD",
  "PACKAGING"
] as const;

export const UNITS = [
  "kg",
  "g",
  "ltr",
  "ml",
  "pc",
  "pkt",
  "box"
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  RAW_MATERIAL:   "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  SEMI_FINISHED:  "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  FINISHED_GOOD:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  PACKAGING:      "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
};
