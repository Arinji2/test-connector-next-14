"use client";

import { useTransition } from "react";
import { Locale, locales } from "@/i18n/config";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ChevronRight, Languages, Moon, Trash, UserRoundCog } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/registry/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/ui/popover";
import { Switch } from "@/registry/ui/switch";

function AccountSettings() {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({
            variant: "ghost",
            size: "icon-sm",
          }),
          "transition-transform duration-300 ease-in-out data-[state=open]:bg-accent"
        )}
        aria-label="Account settings"
      >
        <UserRoundCog className="" size={16} />
      </PopoverTrigger>
      <PopoverContent align="end" className="divide-y p-0" sideOffset={10}>
        <div>
          <LanguageOption />
          <ThemeOption />
        </div>
        <ClearDataOption />
      </PopoverContent>
    </Popover>
  );
}

function LanguageOption() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("AccountSettings.LanguageOption");

  function onChangeLocale(nextLocale: Locale) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({
            variant: "ghost",
          }),
          "w-full gap-2 rounded-none transition-transform duration-300 ease-in-out data-[state=open]:bg-accent"
        )}
        aria-label={t("title")}
      >
        <Languages size={16} />
        <p className="flex-1 text-left">{t("title")}</p>
        <p className="uppercase">{locale}</p>
        <ChevronRight size={16} />
      </PopoverTrigger>
      <PopoverContent align="start" side="right" className="flex w-fit min-w-fit flex-col p-0" sideOffset={2}>
        {locales.map((lang) => (
          <Button
            key={lang}
            size="sm"
            variant="ghost"
            className="rounded-none uppercase"
            aria-label={`Set language to ${lang}`}
            disabled={lang === locale || isPending}
            onClick={() => onChangeLocale(lang)}
          >
            {lang}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function ThemeOption() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("AccountSettings.DarkModeOption");

  const onThemeChange = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button variant="ghost" className="w-full gap-2 rounded-none" onClick={onThemeChange} aria-label={t("title")}>
      <Moon size={16} />
      <p className="flex-1 text-left">{t("title")}</p>
      <Switch checked={resolvedTheme === "dark"} />
    </Button>
  );
}

function ClearDataOption() {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("AccountSettings.ClearDataOption");

  const onClearData = async () => {
    try {
      indexedDB.deleteDatabase("WALLET_CONNECT_V2_INDEXED_DB");
      /* await dAppConnector?.disconnectAll(); */
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Button
      variant="ghost-destructive"
      className="w-full gap-2 rounded-none"
      onClick={() => {
        startTransition(onClearData);
      }}
      disabled={isPending}
      aria-label={t("title")}
    >
      <Trash size={16} />
      <p className="flex-1 text-left">{t("title")}</p>
    </Button>
  );
}

export default AccountSettings;
