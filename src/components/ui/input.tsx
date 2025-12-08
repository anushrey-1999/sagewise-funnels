"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, value, "aria-invalid": ariaInvalid, ...props }: React.ComponentProps<"input">) {
  const [isFocused, setIsFocused] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  
  // Handle autofill background color (only for autofilled inputs)
  React.useEffect(() => {
    const input = inputRef.current
    if (!input) return
    
    // For non-autofilled inputs, CSS classes handle the background
    // Only apply inline styles for autofilled inputs
    const checkAndApplyAutofill = () => {
      // Check if input is autofilled - this is the most reliable way
      try {
        // Use a temporary check - if the input has autofill, override it
        if (input.matches && input.matches(':-webkit-autofill')) {
          if (isFocused) {
            input.style.setProperty('-webkit-box-shadow', `0 0 0 30px var(--sw-input-bg) inset`, 'important')
            input.style.setProperty('box-shadow', `0 0 0 30px var(--sw-input-bg) inset`, 'important')
          } else {
            input.style.setProperty('-webkit-box-shadow', '0 0 0 30px white inset', 'important')
            input.style.setProperty('box-shadow', '0 0 0 30px white inset', 'important')
          }
        } else {
          // Not autofilled - remove any inline box-shadow styles to let CSS handle it
          input.style.removeProperty('-webkit-box-shadow')
          input.style.removeProperty('box-shadow')
        }
      } catch (e) {
        // If matches() fails, just remove inline styles
        input.style.removeProperty('-webkit-box-shadow')
        input.style.removeProperty('box-shadow')
      }
    }
    
    checkAndApplyAutofill()
    // Check again after a delay for autofill detection
    const timeout = setTimeout(checkAndApplyAutofill, 100)
    
    return () => clearTimeout(timeout)
  }, [isFocused])
  
  return (
    <input
      ref={inputRef}
      type={type}
      data-slot="input"
      value={value}
      aria-invalid={ariaInvalid}
      onFocus={() => {
        setIsFocused(true)
      }}
      onBlur={() => {
        setIsFocused(false)
      }}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow,background-color,border-color] duration-200 ease-out will-change-[color,box-shadow,transform,opacity] motion-reduce:transition-none motion-reduce:will-change-auto outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        isFocused 
          ? "!bg-[var(--sw-input-bg)] !border-[var(--sw-green-accent)]" 
          : "!bg-white",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "forced-colors:border-[ButtonBorder] forced-colors:bg-[Field] forced-colors:text-[ButtonText]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
