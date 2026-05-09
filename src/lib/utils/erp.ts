export const generateSKU = (category: string, name: string, size?: string): string => {
  const prefixMap: Record<string, string> = {
    RAW_MATERIAL: "RM",
    RAW_GRAINS: "RM-GR",
    RAW_OILS: "RM-OL",
    RAW_SPICES: "RM-SP",
    PACKAGING_POUCH: "PK-PH",
    PACKAGING_LABEL: "PK-LB",
    PACKAGING_CARTON: "PK-CT",
    SEMI_FINISHED: "SF",
    FINISHED_GOOD: "FG",
    CONSUMABLE: "CN",
    MAINTENANCE: "MN",
  };

  const prefix = prefixMap[category] || "MISC";
  const cleanName = name.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
  const cleanSize = size ? size.toUpperCase().replace(/[^A-Z0-9]/g, "") : "";
  
  return `${prefix}-${cleanName || "ITEM"}${cleanSize ? "-" + cleanSize : ""}`;
};

export const generateEnterpriseSKU = (category: string, name: string): string => {
  const prefix = "ENT";
  const cleanName = name.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}-${category.slice(0, 2)}-${cleanName}-${random}`;
};

export const getCategoryDefaults = (category: string) => {
  switch (category) {
    case "RAW_GRAINS":
    case "RAW_SPICES":
    case "RAW_MATERIAL":
      return { hsnCode: "1006", taxPercent: 5 };
    case "RAW_OILS":
      return { hsnCode: "1512", taxPercent: 12 };
    case "PACKAGING_POUCH":
    case "PACKAGING_LABEL":
    case "PACKAGING_CARTON":
      return { hsnCode: "3923", taxPercent: 18 };
    default:
      return { hsnCode: "", taxPercent: 5 };
  }
};

export const PREDEFINED_SIZES = [
  { id: "1KG", label: "1 KG" },
  { id: "500G", label: "500 G" },
  { id: "250G", label: "250 G" },
  { id: "100G", label: "100 G" },
  { id: "5L", label: "5 Litre" },
  { id: "1L", label: "1 Litre" },
];

export const HSN_GST_MAPPING: Record<string, number> = {
  "1001": 5,  // Wheat
  "1006": 5,  // Rice
  "1507": 12, // Soya oil
  "1512": 12, // Sunflower oil
  "0904": 5,  // Pepper/Chillies
  "0910": 5,  // Spices
  "3923": 18, // Plastic packaging
  "4819": 12, // Cartons
};

export const getGSTByHSN = (hsn: string): number | null => {
  const prefix = hsn.slice(0, 4);
  return HSN_GST_MAPPING[prefix] || null;
};

export const VALUATION_METHODS = [
  { id: "FIFO", label: "First In, First Out" },
  { id: "WEIGHTED_AVG", label: "Weighted Average" },
  { id: "STANDARD_COST", label: "Standard Cost" },
];

export const STORAGE_TYPES = [
  { id: "DRY", label: "Dry Storage (Ambient)" },
  { id: "COLD", label: "Cold Storage (Chilled)" },
  { id: "FROZEN", label: "Frozen Storage" },
  { id: "HAZARDOUS", label: "Hazardous / Chemical" },
];

export const MATERIAL_STATUSES = [
  { id: "DRAFT", label: "Draft (Reviewing)" },
  { id: "PENDING_APPROVAL", label: "Pending Approval" },
  { id: "ACTIVE", label: "Active (Procurement Ready)" },
  { id: "BLOCKED", label: "Blocked (Issue Found)" },
  { id: "ARCHIVED", label: "Archived" },
];
