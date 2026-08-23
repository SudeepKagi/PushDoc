import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[6px] text-sm font-medium font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-white hover:bg-accent-hover",
        destructive:
          "bg-danger text-white hover:opacity-90",
        outline:
          "border border-border bg-surface text-text-primary hover:bg-surface-raised",
        secondary:
          "bg-surface-raised text-text-primary hover:opacity-90",
        ghost:
          "text-text-primary hover:bg-surface-raised",
        link:
          "text-accent underline-offset-4 hover:underline hover:text-accent-hover",
      },
      size: {
        default: "h-8 px-4 py-1.5",
        sm: "h-6 rounded-[6px] px-2.5 text-xs",
        lg: "h-10 rounded-[6px] px-6 text-base",
        icon: "h-8 w-8 rounded-[6px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
