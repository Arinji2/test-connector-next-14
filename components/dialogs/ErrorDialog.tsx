import React from "react";
import { KabilaError, MarketError } from "@kabila-tech/kabila-sdk";
import { useAtom } from "jotai";
import { AlertTriangle, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { errorAtom } from "@/hooks/useControlledFunction";
import { Button } from "@/registry/ui/button";
import { Dialog, DialogBody, DialogContent, DialogTitle } from "@/registry/ui/dialog";

function ErrorDialog() {
  const [error, setError] = useAtom(errorAtom);
  const t = useTranslations("Errors");
  const words = useTranslations("Words");

  if (!error) return null;

  const getTranslation = (key: string) => {
    try {
      const translatedMessage = t(key as never);
      if (translatedMessage === `Errors.${key}`) throw new Error("NO_TRANSLATION");
      return translatedMessage;
    } catch {
      return key;
    }
  };

  const isApprovalRejected = (error as KabilaError)?.code === -32000;

  return (
    <Dialog onOpenChange={() => setError(null)} defaultOpen>
      <DialogContent className="max-w-md">
        <DialogBody>
          <DialogTitle className="flex items-center">
            {isApprovalRejected ? (
              <>
                <AlertTriangle className="mr-2 inline size-6 text-secondary" />
                <span>{words("attention")}</span>
              </>
            ) : (
              <>
                <XCircle className="mr-2 inline size-6 text-destructive" />
                <span>{words("error")}</span>
              </>
            )}
          </DialogTitle>
          <p className="max-w-full text-muted-foreground">
            {getTranslation(
              (error as MarketError)?.reason ??
                error?.status?.toString() ??
                (error as KabilaError)?.code?.toString() ??
                error?.message
            )}
          </p>
          <Button className="mt-4" onClick={() => setError(null)}>
            {words("close")}
          </Button>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export default ErrorDialog;
