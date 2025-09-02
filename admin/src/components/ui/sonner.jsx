"use client";

import React from "react";
import { toast, Toaster as SonnerToaster } from "sonner";

const toasterOptions = {
  className: "toaster group",
  toastOptions: {
    classNames: {
      content:
        "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-md group-[.toaster]:p-4 group-[.toaster]:grid group-[.toaster]:gap-1",
      title: "[&_span]:leading-tight [&_span]:font-semibold",
      description: "text-muted-foreground [&_p]:leading-relaxed [&_p]:text-sm",
      actionButton:
        "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-md border border-primary px-3 font-medium text-xs shadow-sm transition-[color,box-shadow] focus-visible:outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
      cancelButton:
        "bg-muted text-foreground hover:bg-muted/80 focus-visible:ring-ring inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-md border border-input px-3 font-medium text-xs shadow-sm transition-[color,box-shadow] focus-visible:outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
      error: "border-destructive text-destructive dark:border-red-900 dark:bg-red-900 dark:text-red-50",
      success: "bg-primary text-primary-foreground",
      warning: "text-warning border-warning",
      info: "text-info border-info",
      loading: "text-muted-foreground"
    }
  }
};

function Toaster(props) {
  return <SonnerToaster position="top-center" richColors closeButton {...toasterOptions} {...props} />;
}

export { Toaster, toast };
