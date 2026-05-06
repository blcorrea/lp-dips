export type SupportedLocale = "en" | "pt" | "es";

export type LocalizedPricing = {
  price: number;
  currency: "USD" | "BRL" | "EUR";
};

export const LOCALIZED_PRICING: Record<SupportedLocale, LocalizedPricing> = {
  en: {
    price: 29.99,
    currency: "USD",
  },
  pt: {
    price: 89.99,
    currency: "BRL",
  },
  es: {
    price: 24.99,
    currency: "EUR",
  },
};

export function isSupportedLocale(value: string): value is SupportedLocale {
  return value === "en" || value === "pt" || value === "es";
}

export function getLocalizedPricing(locale: string): LocalizedPricing {
  if (isSupportedLocale(locale)) {
    return LOCALIZED_PRICING[locale];
  }

  return LOCALIZED_PRICING.en;
}

export function formatLocalizedPrice(
  locale: string,
  price: number,
  currency: string
) {
  const normalizedLocale =
    locale === "pt" ? "pt-BR" :
    locale === "es" ? "es-ES" :
    "en-US";

  return new Intl.NumberFormat(normalizedLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function getWeightLabel(locale: string, grams: number) {
  if (locale === "pt") return `Peso líquido: ${grams}g`;
  if (locale === "es") return `Peso neto: ${grams}g`;
  return `Net weight: ${grams}g`;
}
