import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-general-border-three shadow-sm text-general-primary",
        secondary:
          "bg-secondary-main text-general-primary",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[44px] px-4 py-2 has-[>svg]:px-3",
        sm: "h-[44px] rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-[44px] rounded-md px-6 has-[>svg]:px-4 text-base lg:text-lg",
        icon: "h-[44px] w-[44px]",
        "icon-sm": "h-[44px] w-[44px]",
        "icon-lg": "h-[44px] w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  icon?: LucideIcon // Lucide icon component
  iconClass?: string // Custom classes for icon (size, color, etc.)
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  icon: Icon,
  iconClass,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  // When iconClass is provided, add a class containing 'size-' to prevent 
  // the default [&_svg:not([class*='size-'])]:size-4 from applying.
  // The 'size-[inherit]' class contains 'size-' so the selector won't match,
  // but it won't override the user's w-1 h-1 classes since those come after.
  const iconClassName = iconClass 
    ? cn("shrink-0", "size-[inherit]", iconClass) // size-[inherit] prevents default, user classes apply
    : "shrink-0"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
      {Icon && <Icon className={iconClassName} />}
    </Comp>
  )
}

export { Button, buttonVariants }
