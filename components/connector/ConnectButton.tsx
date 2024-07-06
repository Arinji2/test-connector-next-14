"use client";

import { Link } from "@/i18n/navigation";
import { PopoverClose } from "@radix-ui/react-popover";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Plus, Unlink, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { useConnector } from "@/hooks/connector/useConnector";
import { useMounted } from "@/hooks/useMounted";
import { Badge } from "@/registry/ui/badge";
import { Button, buttonVariants } from "@/registry/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/ui/popover";
import { Skeleton } from "@/registry/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/ui/tooltip";

function ConnectButton() {
  const { account, accounts, isLoading, changeAccount, disconnect } = useConnector();
  const mounted = useMounted();
  const t = useTranslations("ConnectButton");

  const accountId = account?.id;

  if (isLoading || !mounted) {
    return <Skeleton className="h-10 w-32" />;
  }

  if (!accountId)
    return (
      <Link href="/connect" aria-label={t("title")} className={cn(buttonVariants(), "gap-2")}>
        <Wallet />
        <span>{t("title")}</span>
      </Link>
    );

  return (
    <AnimatePresence>
      <Popover>
        <PopoverTrigger asChild>
          <motion.button
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "group gap-2 bg-header")}
            aria-label="Accounts List"
            transition={{
              duration: 0.3,
            }}
            layout
          >
            <Wallet size={16} className="text-primary" />
            <span>{accountId}</span>
            <ChevronDown
              size={16}
              className="transition-transform duration-300 ease-in-out group-data-[state=open]:rotate-180"
            />
          </motion.button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="max-h-[300px] overflow-y-auto p-0"
          onFocusCapture={(e) => {
            e.stopPropagation();
          }}
          sideOffset={10}
        >
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className={cn(
                buttonVariants({
                  variant: "ghost",
                }),
                "w-full cursor-pointer justify-between rounded-none"
              )}
              onClick={acc.id === accountId ? undefined : () => changeAccount(acc.id)}
            >
              <div className={cn("flex items-center gap-2", acc.id === accountId && "cursor-not-allowed opacity-50")}>
                <Badge>{acc.id}</Badge>
                <span>{acc.alias}</span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost-destructive"
                    size="icon-xs"
                    aria-label={t("disconnect")}
                    onClick={(e) => {
                      e.stopPropagation();
                      disconnect(acc.id, acc.topic);
                    }}
                  >
                    <Unlink size={12} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">{t("disconnect")}</TooltipContent>
              </Tooltip>
            </div>
          ))}
          <PopoverClose className="w-full">
            <Link
              href="/connect"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "w-full gap-2 rounded-none")}
              aria-label={t("addAccount")}
            >
              <Plus size={16} />
              {t("addAccount")}
            </Link>
          </PopoverClose>
        </PopoverContent>
      </Popover>
    </AnimatePresence>
  );
}

export default ConnectButton;
