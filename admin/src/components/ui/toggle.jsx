"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle@1.1.0";

import { cn } from "./utils";

const Toggle = React.forwardRef(({ className, variant = "default", size = "default", pressed, defaultPressed, ...props }, ref) => (
  <TogglePrimitive.Root
    data-slot="toggle"
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background border border-input bg-background shadow-sm transition-[color,box-shadow] hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
      variant === "outline" && "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      size === "sm" && "h-8 px-3 text-xs",
      size === "default" && "h-9 px-4 py-2",
      size === "lg" && "h-10 px-6",
      className,
    )}
    pressed={pressed}
    defaultPressed={defaultPressed}
    {...props}
  />
));
Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle };
