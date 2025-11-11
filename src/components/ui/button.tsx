import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-40 data-[state=open]:bg-slate-800/80",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-brand-foreground shadow-lg shadow-brand/40 hover:bg-brand/90 ring-brand",
        secondary:
          "border border-slate-800 bg-slate-900/60 text-slate-100 shadow-md shadow-slate-950/40 hover:bg-slate-900 ring-slate-700",
        ghost: "text-slate-200 hover:bg-slate-800/60 ring-slate-800",
        destructive:
          "bg-red-600 text-white shadow-lg shadow-red-900/40 hover:bg-red-500 ring-red-400",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
