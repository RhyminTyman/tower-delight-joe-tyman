import * as React from "react";

import { cn } from "@/lib/utils";

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  decorative?: boolean;
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, decorative = true, role = "separator", ...props }, ref) => (
    <div
      ref={ref}
      role={decorative ? "none" : role}
      className={cn("my-4 h-px w-full bg-slate-800", className)}
      {...props}
    />
  ),
);
Separator.displayName = "Separator";

