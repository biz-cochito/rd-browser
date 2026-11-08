/* eslint-disable react-refresh/only-export-components */
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[8px] border border-transparent font-sans text-[14px] font-medium leading-none whitespace-nowrap transition-colors outline-none select-none cursor-pointer focus-visible:border-hairline-strong disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-on-primary hover:bg-primary-active active:bg-primary-active",
        secondary:
          "border-hairline-strong bg-surface-card text-ink hover:bg-canvas-soft active:bg-surface-strong/50",
        outline:
          "border-hairline bg-surface-card text-ink hover:border-hairline-strong hover:bg-canvas-soft active:bg-surface-strong/40",
        download:
          "bg-ink text-canvas hover:opacity-90 active:opacity-80",
        ghost:
          "bg-transparent text-body hover:bg-surface-strong/50 hover:text-ink",
        destructive:
          "border-hairline bg-surface-card text-semantic-error hover:border-semantic-error/40 hover:bg-semantic-error/8",
        link: "text-ink underline-offset-4 hover:underline px-0 h-auto",
      },
      size: {
        default: "h-10 gap-2 px-[18px] py-[10px]",
        xs: "h-7 gap-1.5 px-2.5 text-[12px] rounded-[6px] [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 px-3 text-[13px]",
        lg: "h-11 gap-2 px-5 py-3 text-[14px]",
        icon: "size-10",
        "icon-xs": "size-7 rounded-[6px] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8",
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
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
