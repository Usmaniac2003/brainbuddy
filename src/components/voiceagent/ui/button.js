import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

const getButtonClasses = (variant = "default", size = "default", extraClasses = "") => {
  let baseClasses =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"

  let variantClass = ""
  switch (variant) {
    case "destructive":
      variantClass = "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
      break
    case "outline":
      variantClass = "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
      break
    case "secondary":
      variantClass = "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80"
      break
    case "ghost":
      variantClass = "hover:bg-accent hover:text-accent-foreground"
      break
    case "link":
      variantClass = "text-primary underline-offset-4 hover:underline"
      break
    default:
      variantClass = "bg-primary text-primary-foreground shadow hover:bg-primary/90"
  }

  let sizeClass = ""
  switch (size) {
    case "sm":
      sizeClass = "h-8 rounded-md px-3 text-xs"
      break
    case "lg":
      sizeClass = "h-10 rounded-md px-8"
      break
    case "icon":
      sizeClass = "h-9 w-9"
      break
    default:
      sizeClass = "h-9 px-4 py-2"
  }

  return `${baseClasses} ${variantClass} ${sizeClass} ${extraClasses}`
}

const Button = React.forwardRef(({
  className = "",
  variant,
  size,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={getButtonClasses(variant, size, className)}
      ref={ref}
      {...props}
    />
  )
})

Button.displayName = "Button"

export { Button }
