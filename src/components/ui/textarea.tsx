import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full resize-none rounded-[8px] border border-hairline bg-canvas-soft px-4 py-3 font-mono text-[13px] leading-[1.5] text-ink transition-colors outline-none placeholder:text-muted-soft focus-visible:border-hairline-strong focus-visible:bg-surface-card disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-semantic-error",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
