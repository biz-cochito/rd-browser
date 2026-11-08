import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-[8px] border border-hairline bg-surface-card px-4 py-3 text-[14px] text-ink transition-colors outline-none placeholder:text-muted-soft focus-visible:border-hairline-strong disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-semantic-error",
        className
      )}
      {...props}
    />
  )
}

export { Input }
