"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, value, "aria-invalid": ariaInvalid, ...props }: React.ComponentProps<"input">) {
  const [isFocused, setIsFocused] = React.useState(false)
  
  return (
    <input
      type={type}
      data-slot="input"
      value={value}
      aria-invalid={ariaInvalid}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow,background-color,border-color] duration-200 ease-out will-change-[color,box-shadow,transform,opacity] motion-reduce:transition-none motion-reduce:will-change-auto outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        isFocused 
          ? "bg-[var(--sw-input-bg)] border-[var(--sw-green-accent)]" 
          : "bg-white",
        "focus-visible:border-[var(--sw-green-accent)] focus-visible:bg-[var(--sw-input-bg)]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "forced-colors:border-[ButtonBorder] forced-colors:bg-[Field] forced-colors:text-[ButtonText]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
