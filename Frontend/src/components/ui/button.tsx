import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

/**
 * The one button in the product. Anything that looks clickable and solid
 * should be this component — pages must not hand-roll `<button className=…>`.
 */
const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-fg shadow-e1 hover:bg-accent-hover hover:shadow-e2",
        ink:
          "bg-ink text-ink-inverse shadow-e1 hover:shadow-e2 hover:bg-ink/90",
        secondary:
          "border border-border-strong bg-canvas text-ink shadow-e1 hover:bg-surface hover:shadow-e2",
        subtle:
          "bg-surface-strong text-ink hover:bg-border",
        ghost:
          "text-ink-muted hover:bg-surface hover:text-ink",
        danger:
          "bg-danger text-danger-fg shadow-e1 hover:shadow-e2 hover:brightness-95",
        link:
          "h-auto p-0 text-accent-text underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 rounded-md px-3 text-small [&_svg]:size-4",
        md: "h-10 rounded-md px-4 text-body [&_svg]:size-4",
        // The one size used for page-level calls to action, so its label carries
        // the extra weight the export gives them.
        lg: "h-12 rounded-lg px-6 text-body font-semibold [&_svg]:size-[18px]",
        icon: "h-10 w-10 rounded-md [&_svg]:size-[18px]",
        "icon-sm": "h-8 w-8 rounded-md [&_svg]:size-4",
      },
      pill: {
        true: "rounded-full",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /**
   * Pending state: swaps in a spinner and blocks input, without collapsing the
   * label — the button keeps its width so the layout doesn't jump mid-request.
   * Pass `loadingLabel` when the verb should change ("Start" → "Starting").
   */
  loading?: boolean
  loadingLabel?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      pill,
      block,
      asChild = false,
      loading = false,
      loadingLabel,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    // `asChild` hands rendering to the caller's element, so a spinner can't be
    // injected — the loading affordance is skipped rather than silently broken.
    const showSpinner = loading && !asChild
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, pill, block, className }))}
        ref={ref}
        disabled={disabled || (loading && !asChild)}
        aria-busy={showSpinner || undefined}
        {...props}
      >
        {showSpinner ? (
          <>
            <Spinner size={size === "lg" ? "md" : "sm"} />
            {loadingLabel ?? children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
