import { LocalePrefix } from "next-intl/routing";

export type Locale = "en" | "es";

export const defaultLocale = "en" as const;
export const locales = ["en", "es"] as const;
export const defaultTimeZone = "Europe/Paris";

export const localePrefix: LocalePrefix<typeof locales> = "always";

export const port = process.env.PORT || 3000;
export const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${port}`;
