import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phone: string, defaultCountryCode: string = "+234") {
  // Basic normalization
  let normalized = phone.replace(/[^0-9+]/g, "");
  
  if (normalized.startsWith("0") && normalized.length === 11) {
    // Local format (e.g. Nigeria 080...)
    normalized = defaultCountryCode + normalized.substring(1);
  } else if (!normalized.startsWith("+")) {
    normalized = defaultCountryCode + normalized;
  }
  
  return normalized;
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
