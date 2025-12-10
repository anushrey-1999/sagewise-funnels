"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus:border-[var(--sw-green-accent)] focus:bg-[var(--sw-input-bg)] focus-visible:border-[var(--sw-green-accent)] focus-visible:bg-[var(--sw-input-bg)] focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-[shadow,transform,opacity,background-color,border-color] duration-200 ease-out will-change-[shadow,transform,opacity] motion-reduce:transition-none motion-reduce:will-change-auto outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        "forced-colors:border-[ButtonBorder] forced-colors:bg-[Field] forced-colors:data-[state=checked]:bg-[Highlight]",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
