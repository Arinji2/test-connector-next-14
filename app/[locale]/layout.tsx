import { defaultTimeZone } from "@/i18n/config";
import { NextIntlClientProvider, useLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { ReactNode, use } from "react";

import Providers from "@/components/Providers";
import { cn } from "@/lib/utils";

import { fontMontserrat } from "@/lib/fonts";

type Props = {
  children: ReactNode;
  modal: ReactNode;
  params: { locale: string };
};

export default function LocaleLayout({ children,modal, params }: Props) {
  const locale = useLocale();
  const messages = use(getMessages());

  if (params.locale !== locale) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          "flex h-full flex-col bg-background font-montserrat antialiased",
          fontMontserrat.variable
        )}
      >
        <NextIntlClientProvider
          messages={messages}
          locale={locale}
          timeZone={defaultTimeZone}
        >
          <Providers>
            {/* <Navigation /> */}
            {children}
            {modal}
            {/* <GlobalDialogs /> */}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
