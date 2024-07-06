import { ASSETS_CDN_URL } from "@kabila-tech/kabila-sdk";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const IS_TESTNET_MODE = typeof window !== "undefined" && localStorage.getItem("mode") === "testnet";

export function withTimeout<T>(fn: (...args: any[]) => Promise<T>, timeout = 2000): Function {
  let timer: NodeJS.Timeout;
  return (...args: any) => {
    return new Promise((resolve, reject) => {
      timer = setTimeout(() => {
        resolve(undefined);
      }, timeout);

      Promise.resolve(fn(...args))
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  };
}

export function getAsset(
  path: string,
  options: {
    theme?: "light" | "dark" | null;
    lightName: string;
    darkName: string;
    extension?: string;
    useCdn?: boolean;
  } = {
    theme: null,
    lightName: "dark",
    darkName: "light",
    useCdn: true,
  }
) {
  const domain = options.useCdn ? ASSETS_CDN_URL : "assets/";
  let imageName = "";
  if (options?.theme) {
    imageName = options.theme === "light" ? options.lightName : options.darkName;
  }
  const ext = options?.extension ? options?.extension : path.split(".")?.[-1];
  if (!imageName) {
    return `${domain}${path}`;
  }
  return `${domain}${path}/${imageName}.${ext}`;
}
