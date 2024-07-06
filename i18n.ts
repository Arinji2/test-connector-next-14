import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

import { defaultTimeZone, locales } from "./i18n/config";

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await (locale === "en" ? import("./messages/en.json") : import(`./messages/${locale}.json`))).default,
    timeZone: defaultTimeZone,
  };
});
