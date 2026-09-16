"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  value,
  "aria-invalid": ariaInvalid,
  onFocus,
  onBlur,
  ...props
}: React.ComponentProps<"input">) {
  const [isFocused, setIsFocused] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  
  // Handle autofill background color - always white
  React.useEffect(() => {
    const input = inputRef.current
    if (!input) return
    
    const checkAndApplyAutofill = () => {
      try {
        if (input.matches && input.matches(':-webkit-autofill')) {
          input.style.setProperty('-webkit-box-shadow', '0 0 0 30px white inset', 'important')
          input.style.setProperty('box-shadow', '0 0 0 30px white inset', 'important')
        } else {
          input.style.removeProperty('-webkit-box-shadow')
          input.style.removeProperty('box-shadow')
        }
      } catch {
        input.style.removeProperty('-webkit-box-shadow')
        input.style.removeProperty('box-shadow')
      }
    }
    
    checkAndApplyAutofill()
    const timeout = setTimeout(checkAndApplyAutofill, 100)
    
    return () => clearTimeout(timeout)
  }, [])
  
  return (
    <input
      ref={inputRef}
      type={type}
      data-slot="input"
      value={value}
      aria-invalid={ariaInvalid}
      {...props}
      onFocus={(event) => {
        setIsFocused(true)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setIsFocused(false)
        onBlur?.(event)
      }}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-aw-border w-full min-w-0 rounded-[var(--radius-field)] border-[1.5px] h-[58px] min-h-[58px] px-3 py-1 text-base shadow-[var(--field-shadow)] transition-[color,box-shadow,background-color,border-color] duration-200 ease-out will-change-[color,box-shadow,transform,opacity] motion-reduce:transition-none motion-reduce:will-change-auto outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm cursor-pointer hover:border-sg-primary-green hover:shadow-[var(--focus-ring)] focus-visible:shadow-[var(--focus-ring)] bg-white!",
        isFocused && !ariaInvalid && "border-sg-primary-green!",
        isFocused && ariaInvalid && "border-destructive!",
        // Error state: red border + red ring always visible (not just on hover/focus) — per spec §04.
        "aria-invalid:border-destructive aria-invalid:shadow-[var(--focus-ring-error)] aria-invalid:hover:border-destructive aria-invalid:hover:shadow-[var(--focus-ring-error)] aria-invalid:focus-visible:shadow-[var(--focus-ring-error)]",
        "forced-colors:border-[ButtonBorder] forced-colors:bg-[Field] forced-colors:text-[ButtonText]",
        className
      )}
    />
  )
}

export { Input }
