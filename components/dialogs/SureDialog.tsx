import React, { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/registry/ui/button";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogTitle } from "@/registry/ui/dialog";

export type SureDialogProps = {
  title: string;
  descriptions: (string | ReactNode)[];
  backText?: string;
  onClose: () => void;
  onBack?: () => void;
  onNext?: () => void;
};

function SureDialog({ title, descriptions, backText = "cancel", onClose, onBack, onNext }: SureDialogProps) {
  const words = useTranslations("Words");

  return (
    <Dialog defaultOpen onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          {descriptions.map((description, index) => {
            if (typeof description === "string")
              return (
                <p key={index} className="max-w-full text-muted-foreground">
                  {description}
                </p>
              );

            return (
              <div key={index} className="max-w-full text-muted-foreground">
                {description}
              </div>
            );
          })}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              onClose();
              if (onBack) onBack();
            }}
          >
            {words(backText as any)}
          </Button>
          <Button
            onClick={() => {
              onClose();
              if (onNext) onNext();
            }}
          >
            {words("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SureDialog;
