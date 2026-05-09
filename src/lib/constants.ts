export const ITEM_CATEGORIES = [
  "RAW_MATERIAL",
  "RAW_GRAINS",
  "RAW_OILS",
  "RAW_SPICES",
  "PACKAGING_POUCH",
  "PACKAGING_LABEL",
  "PACKAGING_CARTON",
  "SEMI_FINISHED",
  "FINISHED_GOOD",
  "CONSUMABLE",
  "MAINTENANCE"
] as const;

export const UNITS = [
  "kg",
  "g",
  "ltr",
  "ml",
  "pc",
  "pkt",
  "box",
  "bag",
  "ton",
  "drum",
  "can",
  "bale",
  "roll"
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  RAW_MATERIAL:    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  RAW_GRAINS:      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  RAW_OILS:        "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  RAW_SPICES:      "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  PACKAGING_POUCH: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  PACKAGING_LABEL: "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400",
  PACKAGING_CARTON: "bg-stone-100 text-stone-700 dark:bg-stone-900/20 dark:text-stone-400",
  SEMI_FINISHED:   "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  FINISHED_GOOD:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  CONSUMABLE:      "bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400",
  MAINTENANCE:     "bg-zinc-100 text-zinc-700 dark:bg-zinc-900/20 dark:text-zinc-400",
};
