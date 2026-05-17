export const locales = ["uz-Latn", "uz-Cyrl", "ru", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "uz-Latn";

export const localeLabels: Record<Locale, string> = {
  "uz-Latn": "O'zbekcha (Lotin)",
  "uz-Cyrl": "Ўзбекча (Кирил)",
  ru: "Русский",
  en: "English",
};

export const localeToPrisma: Record<Locale, "uz_Latn" | "uz_Cyrl" | "ru" | "en"> = {
  "uz-Latn": "uz_Latn",
  "uz-Cyrl": "uz_Cyrl",
  ru: "ru",
  en: "en",
};

export const prismaToLocale: Record<"uz_Latn" | "uz_Cyrl" | "ru" | "en", Locale> = {
  uz_Latn: "uz-Latn",
  uz_Cyrl: "uz-Cyrl",
  ru: "ru",
  en: "en",
};
