"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "checked"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, checked, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(event.target.checked)
      props.onChange?.(event)
    }

    return (
      <label className="relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full border-2 border-transparent bg-slate-200 transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 peer-checked:bg-blue-600">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          className={cn(
            "sr-only peer",
            className
          )}
          onChange={handleChange}
          {...props}
        />
        <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform peer-checked:translate-x-5 peer-checked:border-white" />
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
