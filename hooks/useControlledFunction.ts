import { ErrorType, KabilaError, Klog, MarketError } from "@kabila-tech/kabila-sdk";
import { atom, useSetAtom } from "jotai";

import { LoadingDialogProps } from "@/components/dialogs/LoadingDialog";
import { SureDialogProps } from "@/components/dialogs/SureDialog";


export const errorAtom = atom<KabilaError | MarketError | null>(null);
export const successMessageAtom = atom<string>("");
export const loadingDialogAtom = atom<LoadingDialogProps>({ open: false });
export const loadingClosableAtom = atom(true);
export const sureDialogAtom = atom<Omit<SureDialogProps, "onClose"> | null>(null);

type Options = {
  loadingProps?: Omit<LoadingDialogProps, "open">;
  onError?: Function;
  onFinally?: Function;
  hideError?: boolean;
  successMessage?: string;
};

export function useControlledFunction(fn: Function, options?: Options) {
  const setLoading = useSetAtom(loadingDialogAtom);
  const setError = useSetAtom(errorAtom);
  const setSuccessMessage = useSetAtom(successMessageAtom);

  return async (...args: any[]) => {
    try {
      const controller = new AbortController();
      const signal = controller.signal;
      const dialogPromise = new Promise((_, reject) => {
        setLoading({
          open: true,
          ...options?.loadingProps,
          onCancel: () => {
            Klog.info("User rejected open wallet request");
            reject(new KabilaError("Request cancel", ErrorType.CONNECTOR, undefined, 3998));
            controller.abort("Request cancel");
          },
        });
      });

      await Promise.race([fn(...args, signal), dialogPromise]);

      if (options?.successMessage) {
        setSuccessMessage(options.successMessage);
      }
    } catch (error: any) {
      if (options?.onError) options.onError(error);
      else console.error(error);
      if (!options?.hideError) {
        setError(error as KabilaError);
      }
    } finally {
      setLoading({ open: false });
      if (options?.onFinally) options.onFinally();
      /* if (step) setStep(null); */
    }
  };
}
