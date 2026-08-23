import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[4px] px-2 py-0.5 text-xs font-mono font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-surface-raised text-text-primary",
        secondary:
          "bg-surface-raised text-text-secondary",
        accent:
          "bg-accent/15 text-accent",
        destructive:
          "bg-danger/15 text-danger",
        success:
          "bg-success/15 text-success",
        warning:
          "bg-warning/15 text-warning",
        outline:
          "border border-border text-text-secondary bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
