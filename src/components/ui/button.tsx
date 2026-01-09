import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary - Warm terracotta, solid
        default: "bg-primary text-primary-foreground rounded-xl shadow-sm hover:brightness-105 hover:shadow-md active:scale-[0.98]",

        // Secondary - Outlined, sophisticated
        secondary: "border-2 border-premier-sand-dark text-foreground rounded-xl bg-transparent hover:bg-premier-mist hover:border-premier-ink/20",

        // Outline - Clean border
        outline: "border-2 border-border bg-background rounded-xl hover:bg-muted hover:border-premier-ink/20",

        // Ghost - Minimal
        ghost: "text-foreground rounded-xl hover:bg-premier-ink/5",

        // Subtle - For dense UI areas
        subtle: "bg-premier-mist text-foreground rounded-xl hover:bg-premier-sand",

        // Success - Sage green for confirmations
        success: "bg-premier-sage text-white rounded-xl shadow-sm hover:brightness-110 active:scale-[0.98]",

        // Danger/Destructive
        danger: "bg-destructive text-destructive-foreground rounded-xl shadow-sm hover:brightness-110 active:scale-[0.98]",
        destructive: "bg-destructive text-destructive-foreground rounded-xl shadow-sm hover:brightness-110 active:scale-[0.98]",

        // Link style
        link: "text-premier-accent hover:text-premier-accent-soft underline-offset-4 hover:underline p-0 h-auto rounded-none",

        // Checkout/CTA - Uses primary accent
        checkout: "bg-primary text-primary-foreground rounded-xl shadow-md hover:brightness-105 hover:shadow-lg active:scale-[0.98]",

        // Add to cart - Same as primary for consistency
        "add-to-cart": "bg-primary text-primary-foreground rounded-xl shadow-sm hover:brightness-105 hover:shadow-md active:scale-[0.98]",

        // Step navigation
        step: "bg-card border-2 border-border rounded-xl hover:bg-muted hover:border-premier-ink/20",
        "step-active": "bg-primary text-primary-foreground border-2 border-primary rounded-xl shadow-sm",

        // Legacy support (map to new variants)
        delivery: "bg-primary text-primary-foreground rounded-xl shadow-sm hover:brightness-105 hover:shadow-md active:scale-[0.98]",
        cart: "bg-premier-sage text-white rounded-xl shadow-sm hover:brightness-110 active:scale-[0.98]",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-lg",
        default: "h-11 px-6 text-sm rounded-xl",
        lg: "h-12 px-8 text-base rounded-xl",
        xl: "h-14 px-10 text-base font-semibold rounded-2xl",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
