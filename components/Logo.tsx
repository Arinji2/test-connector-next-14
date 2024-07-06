"use client";

import Image, { ImageProps } from "next/image";
import { useTheme } from "next-themes";

import { cn, getAsset } from "@/lib/utils";
import { useMounted } from "@/hooks/useMounted";
import { Skeleton } from "@/registry/ui/skeleton";

type LogoProps = {
  alt?: string;
  path: string;
  lightName?: string;
  darkName?: string;
  extension?: "svg" | "png";
  withTheme?: boolean;
  useCdn?: boolean;
  isIcon?: boolean;
  withSkeleton?: boolean;
} & Omit<ImageProps, "src" | "alt">;

const Logo = ({
  alt,
  height,
  width,
  path,
  lightName = "dark",
  darkName = "light",
  extension = "svg",
  withTheme = false,
  useCdn = true,
  isIcon = false,
  withSkeleton = false,
  className,
  ...props
}: LogoProps) => {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted && withSkeleton)
    return <Skeleton className={cn("h-8 w-28", isIcon && "size-5 rounded-full", className)} />;

  const imageUrl = getAsset(path, {
    theme: withTheme ? (resolvedTheme as "light" | "dark") : undefined,
    lightName,
    darkName,
    extension,
    useCdn,
  });

  if (!imageUrl) return null;

  return (
    <Image
      src={imageUrl}
      {...(!props?.fill && { width: width ?? (isIcon ? 24 : 120) })}
      {...(!props?.fill && { height: height ?? 24 })}
      sizes={isIcon ? "24px" : `${width ?? 120}px`}
      className={cn(className)}
      alt={alt ?? path}
      {...props}
    />
  );
};

export default Logo;
