import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap outline-none select-none transition-[color,background-color,border-color,opacity,transform] duration-[120ms] ease-[var(--ease-out)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[var(--brand-hover)]",
        outline:
          "border-border bg-background text-foreground hover:border-[var(--border-strong)]",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:border-[var(--border-strong)]",
        ghost: "text-foreground hover:text-primary",
        destructive: "bg-destructive text-white hover:opacity-90",
        link: "rounded-none text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-11 gap-1.5 px-5 py-2.5",
        xs: "min-h-8 gap-1 px-3 text-xs",
        sm: "min-h-9 gap-1 px-4 text-sm",
        lg: "min-h-11 gap-1.5 px-6",
        icon: "size-11",
        "icon-xs": "size-8",
        "icon-sm": "size-11 md:size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
