export const PREDEFINED_SIZES = [
  "1KG", "500G", "250G", "100G",
  "25KG", "5KG", "2KG",
  "1L", "500ML", "250ML",
  "PCS", "BOTTLE", "PACKET", "BOX"
];

export const getCategoryDefaults = (category: string) => {
  const defaults: Record<string, { hsnCode: string; taxPercent: number; prefix: string }> = {
    BATTER: { hsnCode: "2106", taxPercent: 5, prefix: "BAT" },
    RAW_MATERIAL: { hsnCode: "1006", taxPercent: 0, prefix: "RAW" }, // Default to Rice/grain
    SNACK: { hsnCode: "2106", taxPercent: 12, prefix: "SNK" },
    BEVERAGE: { hsnCode: "2202", taxPercent: 12, prefix: "BEV" },
    CONDIMENT: { hsnCode: "2103", taxPercent: 12, prefix: "CND" },
    PACKAGING: { hsnCode: "4819", taxPercent: 18, prefix: "PKG" },
    SEMI_FINISHED: { hsnCode: "2106", taxPercent: 5, prefix: "SMI" },
    FINISHED_GOOD: { hsnCode: "2106", taxPercent: 5, prefix: "FIN" },
  };

  const catStr = category.toUpperCase();
  if (defaults[catStr]) {
    return defaults[catStr];
  }

  return { hsnCode: "", taxPercent: 0, prefix: catStr.substring(0, 3) };
};

export const generateSKU = (category: string, name: string, size: string): string => {
  const { prefix } = getCategoryDefaults(category);
  // Get first distinct word from name, remove symbols
  const namePart = name 
    ? name.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 6) 
    : '';
  const sizePart = size ? size.toUpperCase() : '';
  
  const parts = [prefix, namePart, sizePart].filter(Boolean);
  return parts.join('-');
};
