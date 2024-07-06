import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary/10 text-primary",
        solid: "border-transparent bg-accent text-accent-foreground",
        secondary: "border-secondary bg-secondary/10 text-secondary",
        tertiary: "border-tertiary bg-tertiary/10 text-tertiary",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        "outline-destructive": "border-destructive bg-destructive/10 text-destructive",
        outline: "border-foreground text-foreground",
      },
      size: {
        default: "px-2.5 py-0.5",
        sm: "py-0.25 px-1.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
