import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";

import { loadingClosableAtom } from "@/hooks/useControlledFunction";
import { Dialog, DialogBody, DialogContent } from "@/registry/ui/dialog";

export type LoadingDialogProps = {
  open: boolean;
  children?: ReactNode;
  title?: string;
  message?: string;
  onCancel?: () => void;
};

function LoadingDialog({ open, children, title, message, onCancel }: LoadingDialogProps) {
  const [isUnclosable, setIsUnclosable] = useAtom(loadingClosableAtom);
  const [_isClosable, setClosableDelayed] = useState(false);
  const isUnclosableRef = useRef(isUnclosable);

  useEffect(() => {
    if (onCancel && !isUnclosable) {
      setTimeout(() => {
        if (!_isClosable && !isUnclosableRef.current && open) setClosableDelayed(true);
      }, 10_000);
    } else {
      if (_isClosable) setClosableDelayed(false);
    }
  }, [onCancel, isUnclosable]);

  useEffect(() => {
    isUnclosableRef.current = isUnclosable;
    if (isUnclosable) setClosableDelayed(false);
    return () => {
      setIsUnclosable(false);
    };
  }, [isUnclosable]);

  return (
    <Dialog
      open={open}
      onOpenChange={(opened) => {
        if (!opened) {
          if (onCancel) onCancel();
          setClosableDelayed(false);
        }
      }}
    >
      <DialogContent className="max-w-xl items-center" isClosable={_isClosable}>
        <DialogBody>
          {title && <h4 className="text-center text-2xl font-semibold">{title}</h4>}
          <div className="max-h-full w-full space-y-6 py-4">{children ?? <p>Loading...</p>}</div>
          {message && <p className="text-center text-muted-foreground">{message}</p>}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export default LoadingDialog;
