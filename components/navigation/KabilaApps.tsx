"use client";

import { KABILA_APPS } from "@kabila-tech/kabila-sdk";
import { Grip } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { cn } from "@/lib/utils";
import SparklesText from "@/registry/ui/animations/SparklesText";
import { buttonVariants } from "@/registry/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/ui/popover";

import Logo from "../Logo";

function KabilaApps() {
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
        aria-label="Kabila Apps"
      >
        <Grip size={16} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-fit p-0" sideOffset={10}>
        <div className="grid grid-cols-2">
          {KABILA_APPS.map((app) => {
            if (app.isComingSoon) {
              return <AppItem key={app.shortName} app={app} />;
            }

            return (
              <Link key={app.shortName} href={app.url} target="_blank" rel="noreferrer">
                <AppItem key={app.shortName} app={app} />
              </Link>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const AppItem = ({ app }: { app: (typeof KABILA_APPS)[0] }) => {
  const t = useTranslations("Words");

  return (
    <div
      key={app.shortName}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "relative flex aspect-square h-auto w-full max-w-[100px] flex-col items-center gap-2 rounded-none p-4",
        app?.isComingSoon && "cursor-not-allowed opacity-50 hover:bg-transparent"
      )}
    >
      <div className="relative aspect-square w-8">
        <Logo path={`icons/${app.shortName.toLowerCase()}/default.svg`} sizes="32px" fill withSkeleton />
      </div>
      <p className="text-center text-sm">{app.shortName}</p>
      {app?.isComingSoon && (
        <SparklesText
          text={t("soon")}
          colors={{
            first: "#4cb896",
            second: "#ffcd05",
          }}
          sparklesCount={5}
          className="absolute top-0.5 uppercase"
        />
      )}
    </div>
  );
};

export default KabilaApps;
