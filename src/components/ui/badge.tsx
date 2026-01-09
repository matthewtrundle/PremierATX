import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Primary - Terracotta accent
        default: "bg-premier-accent/15 text-premier-accent border border-premier-accent/20",
        // Secondary - Subtle muted
        secondary: "bg-premier-sand text-premier-ink-soft border border-premier-sand-dark/20",
        // Success - Sage green
        success: "bg-premier-sage-soft/30 text-premier-sage border border-premier-sage/20",
        // Destructive
        destructive: "bg-destructive/15 text-destructive border border-destructive/20",
        // Outline - Clean border
        outline: "border border-premier-sand-dark/40 text-premier-ink-soft bg-transparent",
        // Featured - For highlighted items
        featured: "bg-premier-accent text-white border-transparent",
        // Info - Subtle blue
        info: "bg-blue-50 text-blue-700 border border-blue-200/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
