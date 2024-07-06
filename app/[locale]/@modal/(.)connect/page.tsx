"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogTitle } from "@/registry/ui/dialog";

function ConnectInterception() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const t = useTranslations("ConnectButton");

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      router.back();
    }, 200);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent>
        <DialogBody className="items-center gap-8">
          <div className="flex flex-col items-center gap-1">
            <DialogTitle className="text-2xl">{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </div>
          {/* <ConnectOptions callback={handleClose} /> */}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export default ConnectInterception;
