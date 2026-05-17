import { parsePhoneNumberFromString } from "libphonenumber-js/min";

/**
 * Normalize any Uzbek phone input into the canonical 998XXXXXXXXX form
 * (12 digits, no leading +). Throws on invalid input.
 */
export function normalizeUzbekPhone(input: string): string {
  const digitsOnly = input.replace(/\D/g, "");
  // Accept inputs like "901234567", "998901234567", "+998901234567", "+998 (90) 123-45-67"
  const withCc = digitsOnly.startsWith("998") ? digitsOnly : `998${digitsOnly}`;
  const parsed = parsePhoneNumberFromString(`+${withCc}`, "UZ");
  if (!parsed || !parsed.isValid() || parsed.country !== "UZ") {
    throw new Error("INVALID_UZ_PHONE");
  }
  // parsed.number is "+998901234567"; strip the +
  return parsed.number.replace(/^\+/, "");
}

export function isValidUzbekPhone(input: string): boolean {
  try {
    normalizeUzbekPhone(input);
    return true;
  } catch {
    return false;
  }
}

/** Format a 9-digit national number into "+998 (XX) XXX-XX-XX" for display in the input mask. */
export function formatUzbekPhoneMask(digits9: string): string {
  const d = digits9.replace(/\D/g, "").slice(0, 9);
  const p1 = d.slice(0, 2);
  const p2 = d.slice(2, 5);
  const p3 = d.slice(5, 7);
  const p4 = d.slice(7, 9);
  let out = "+998";
  if (p1) out += ` (${p1})`;
  if (p2) out += ` ${p2}`;
  if (p3) out += `-${p3}`;
  if (p4) out += `-${p4}`;
  return out;
}
