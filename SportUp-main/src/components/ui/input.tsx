
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, prefixIcon, value: incomingValue, ...restProps }, ref) => {
    const displayValue = (incomingValue === null || incomingValue === undefined) ? "" : incomingValue;

    if (prefixIcon) {
      return (
        <div className={cn("relative flex items-center w-full", className)}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
            {prefixIcon}
          </span>
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background py-2 px-3 pl-10 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            )}
            ref={ref}
            value={displayValue}
            {...restProps}
          />
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        value={displayValue}
        {...restProps}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
