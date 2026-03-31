"use client";

import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "rounded-2xl",
          title: "text-sm font-medium",
          description: "text-xs",
        },
      }}
    />
  );
}
