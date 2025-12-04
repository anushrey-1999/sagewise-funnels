import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 lg:text-5xl font-semibold tracking-tight leading-[120%] first:mt-0",
      h3: "scroll-m-20 lg:text-2xl font-semibold tracking-tight ",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      h5: "scroll-m-20 lg:text-xl font-semibold tracking-tight leading-[120%]",
      h6: "scroll-m-20 text-base font-semibold tracking-tight",
      p: "leading-7 text-black",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      ul: "ml-6 list-disc list-outside [&>li]:mt-2 text-black",
      ol: "ml-6 list-decimal [&>li]:mt-2 text-black",
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
      monospaced: "font-mono text-black",
    },
  },
  defaultVariants: {
    variant: "p",
  },
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
  color?: string; // Tailwind color class or custom color (e.g., "text-blue-500", "text-[#ff0000]")
  size?: string; // Tailwind text size class (e.g., "text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl", "text-5xl", "text-6xl", or custom like "text-[18px]")
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, as, color, size, ...props }, ref) => {
    const Component = (as || getDefaultTag(variant)) as React.ElementType;
    // Variants that have their own color should not get default white
    const variantsWithOwnColor = ["muted", "lead", "p", "ul", "ol", "monospaced"];
    const hasOwnColor = variant && variantsWithOwnColor.includes(variant);
    
    // If color prop is provided, use it; otherwise use default white (unless variant has own color)
    // When color is provided, it will override any variant-specific colors
    const colorClass = color || (hasOwnColor ? "" : "text-white");
    
    // If size prop is provided, it will override the variant's default size
    // We need to remove existing text size classes from the variant and add the new one
    const sizeClass = size || "";
    
    return (
      <Component
        ref={ref}
        className={cn(
          typographyVariants({ variant }),
          colorClass,
          sizeClass,
          className
        )}
        {...props}
      />
    );
  }
);
Typography.displayName = "Typography";

function getDefaultTag(variant?: string | null): string {
  switch (variant) {
    case "h1":
      return "h1";
    case "h2":
      return "h2";
    case "h3":
      return "h3";
    case "h4":
      return "h4";
    case "h5":
      return "h5";
    case "h6":
      return "h6";
    case "p":
      return "p";
    case "blockquote":
      return "blockquote";
    case "ul":
      return "ul";
    case "ol":
      return "ol";
    case "code":
      return "code";
    case "lead":
      return "p";
    case "large":
      return "div";
    case "small":
      return "small";
    case "muted":
      return "p";
    case "monospaced":
      return "p";
    default:
      return "p";
  }
}

// Convenience components for each variant
export const H1 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { color?: string; size?: string }
>(({ className, color, size, ...props }, ref) => (
  <Typography ref={ref} variant="h1" className={className} color={color} size={size} {...props} />
));
H1.displayName = "H1";

export const H2 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { color?: string; size?: string }
>(({ className, color, size, ...props }, ref) => (
  <Typography ref={ref} variant="h2" className={className} color={color} size={size} {...props} />
));
H2.displayName = "H2";

export const H3 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { color?: string; size?: string }
>(({ className, color, size, ...props }, ref) => (
  <Typography ref={ref} variant="h3" className={className} color={color} size={size} {...props} />
));
H3.displayName = "H3";

export const H4 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { color?: string; size?: string }
>(({ className, color, size, ...props }, ref) => (
  <Typography ref={ref} variant="h4" className={className} color={color} size={size} {...props} />
));
H4.displayName = "H4";

export const H5 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { color?: string; size?: string }
>(({ className, color, size, ...props }, ref) => (
  <Typography ref={ref} variant="h5" className={className} color={color} size={size} {...props} />
));
H5.displayName = "H5";

export const H6 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { color?: string; size?: string }
>(({ className, color, size, ...props }, ref) => (
  <Typography ref={ref} variant="h6" className={className} color={color} size={size} {...props} />
));
H6.displayName = "H6";

export const P = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { color?: string; size?: string }
>(({ className, color, size, ...props }, ref) => (
  <Typography ref={ref} variant="p" className={className} color={color} size={size} {...props} />
));
P.displayName = "P";

export const Blockquote = React.forwardRef<
  HTMLQuoteElement,
  React.BlockquoteHTMLAttributes<HTMLQuoteElement> & { color?: string; size?: string }
>(({ className, color, size, ...props }, ref) => (
  <Typography ref={ref} variant="blockquote" className={className} color={color} size={size} {...props} />
));
Blockquote.displayName = "Blockquote";

export const Ul = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement> & { color?: string; size?: string }
>(({ className, color, size, ...props }, ref) => (
  <Typography ref={ref} variant="ul" className={className} color={color} size={size} {...props} />
));
Ul.displayName = "Ul";

export const Ol = React.forwardRef<
  HTMLOListElement,
  React.HTMLAttributes<HTMLOListElement> & { color?: string; size?: string }
>(({ className, color, size, ...props }, ref) => (
  <Typography ref={ref} variant="ol" className={className} color={color} size={size} {...props} />
));
Ol.displayName = "Ol";

export const Code = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { color?: string; size?: string }
>(({ className, color, size, ...props }, ref) => (
  <Typography ref={ref} variant="code" className={className} color={color} size={size} {...props} />
));
Code.displayName = "Code";

export const Lead = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { color?: string; size?: string }
>(({ className, color, size, ...props }, ref) => (
  <Typography ref={ref} variant="lead" className={className} color={color} size={size} {...props} />
));
Lead.displayName = "Lead";

export const Large = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { color?: string; size?: string }
>(({ className, color, size, ...props }, ref) => (
  <Typography ref={ref} variant="large" className={className} color={color} size={size} {...props} />
));
Large.displayName = "Large";

export const Small = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { color?: string; size?: string }
>(({ className, color, size, ...props }, ref) => (
  <Typography ref={ref} variant="small" className={className} color={color} size={size} {...props} />
));
Small.displayName = "Small";

export const Muted = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { color?: string; size?: string }
>(({ className, color, size, ...props }, ref) => (
  <Typography ref={ref} variant="muted" className={className} color={color} size={size} {...props} />
));
Muted.displayName = "Muted";

export const Monospaced = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { color?: string; size?: string }
>(({ className, color, size, ...props }, ref) => (
  <Typography ref={ref} variant="monospaced" className={className} color={color} size={size} {...props} />
));
Monospaced.displayName = "Monospaced";

export { Typography, typographyVariants };

