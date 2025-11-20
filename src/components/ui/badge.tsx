import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center border font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden text-white",
  {
    variants: {
      variant: {
        default:
          "border-none bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-none bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-none bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
      size: {
        small: "px-1.5 py-0.5 text-xs gap-1 [&>svg]:size-3",
        medium: "px-2 py-[3px] text-xs gap-1 [&>svg]:size-3",
        large: "px-3 py-1 text-sm gap-1.5 [&>svg]:size-4",
      },
      radius: {
        none: "rounded-none",
        sm: "rounded-sm",
        default: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "medium",
      radius: "full",
    },
  }
);

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  bgColor?: string; // Tailwind background color class (e.g., "bg-primary-main", "bg-blue-500")
  textColor?: string; // Tailwind text color class (e.g., "text-primary-main", "text-black")
  borderColor?: string; // Tailwind border color class (e.g., "border-primary-main", "border-green-600")
  borderRadius?: string; // Tailwind border radius class (e.g., "rounded-lg", "rounded-[8px]")
}

function Badge({
  className,
  variant,
  size,
  radius,
  asChild = false,
  bgColor,
  textColor,
  borderColor,
  borderRadius,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(
        badgeVariants({ variant, size, radius }),
        bgColor && bgColor,
        textColor && textColor,
        borderColor && borderColor,
        borderColor && "border", // Ensure border is visible when borderColor is provided
        borderRadius && borderRadius,
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
