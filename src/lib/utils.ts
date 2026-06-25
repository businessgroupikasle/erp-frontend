import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "₹") {
  const isNegative = amount < 0;
  const absVal = Math.abs(Math.round(amount));
  return `${isNegative ? '-' : ''}${currency}${absVal.toLocaleString("en-IN")}`;
}

export function formatERPNumber(
  prefix: "PO" | "GRN" | "BT" | "DC" | "INV" | "RCPT",
  idOrCode: string | number | undefined,
  dateStr?: string
): string {
  if (!idOrCode) {
    const defaultYear = dateStr ? new Date(dateStr).getFullYear() : 2026;
    return `${prefix}-${defaultYear}-0000`;
  }
  
  const str = String(idOrCode);
  
  // If it already matches the correct pattern (e.g. PREFIX-YYYY-XXXX), return it directly
  const exactRegex = new RegExp(`^${prefix}-\\d{4}-\\d{4}$`);
  if (exactRegex.test(str)) {
    return str;
  }

  // Handle case where year is already in the string (e.g., PO-2026-0001 or DC-2026-00001)
  const generalRegex = new RegExp(`^${prefix}-(\\d{4})-(\\d+)$`);
  const matchGroup = str.match(generalRegex);
  if (matchGroup) {
    const year = matchGroup[1];
    const sequence = matchGroup[2].padStart(4, "0").slice(-4);
    return `${prefix}-${year}-${sequence}`;
  }
  
  // Extract or generate a 4-digit suffix from the input
  let suffix = "0001";
  if (typeof idOrCode === "number") {
    suffix = String(idOrCode).padStart(4, "0");
  } else {
    // Check if there are digits at the end of the string
    const digitMatch = str.match(/\d+$/);
    if (digitMatch) {
      suffix = digitMatch[0].padStart(4, "0").slice(-4);
    } else {
      // Create a deterministic hash from the UUID/string
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      suffix = String(Math.abs(hash) % 10000).padStart(4, "0");
    }
  }
  
  const year = dateStr ? new Date(dateStr).getFullYear() : 2026;
  return `${prefix}-${year}-${suffix}`;
}

