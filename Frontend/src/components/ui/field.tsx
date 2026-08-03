import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Label + control + error, in the one arrangement the product uses.
 * The error is wired to the control via aria-describedby by the caller passing
 * the same id, so screen readers announce validation failures.
 */
type FieldProps = {
  label: string
  htmlFor: string
  error?: string | null
  hint?: React.ReactNode
  required?: boolean
  children: React.ReactNode
  className?: string
}

function Field({ label, htmlFor, error, hint, required, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-small font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-small text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="text-small text-ink-subtle">{hint}</p>
      )}
    </div>
  )
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }

const TextInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-10 w-full rounded-md border bg-canvas px-3 text-body text-ink transition-colors",
        "placeholder:text-ink-subtle",
        "focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-0",
        "disabled:cursor-not-allowed disabled:opacity-60",
        invalid ? "border-danger" : "border-border-strong",
        className
      )}
      {...props}
    />
  )
)
TextInput.displayName = "TextInput"

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, ...props }, ref) => (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-10 w-full rounded-md border bg-canvas px-3 text-body text-ink transition-colors",
        "focus:border-accent disabled:cursor-not-allowed disabled:opacity-60",
        invalid ? "border-danger" : "border-border-strong",
        className
      )}
      {...props}
    />
  )
)
Select.displayName = "Select"

export { Field, TextInput, Select }
