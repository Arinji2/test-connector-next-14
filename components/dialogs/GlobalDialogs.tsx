"use client";

import { useAtom, useAtomValue } from "jotai";

import { loadingDialogAtom, sureDialogAtom } from "@/hooks/useControlledFunction";

import ErrorDialog from "./ErrorDialog";
import LoadingDialog from "./LoadingDialog";
import SureDialog from "./SureDialog";

function GlobalDialogs() {
  const loadingProps = useAtomValue(loadingDialogAtom);
  const [sureDialog, setSureDialog] = useAtom(sureDialogAtom);

  return (
    <>
      {sureDialog && <SureDialog {...sureDialog} onClose={() => setSureDialog(null)} />}
      <LoadingDialog {...loadingProps} />
      <ErrorDialog />
    </>
  );
}

export default GlobalDialogs;
