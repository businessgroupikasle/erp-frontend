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

