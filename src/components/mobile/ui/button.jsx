import * as React from "react"

const buttonVariants = {
  variant: {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    ghost: "hover:bg-slate-100 hover:text-slate-900",
    link: "text-blue-600 underline-offset-4 hover:underline",
  },
  size: {
    default: "h-12 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-14 rounded-md px-8",
    icon: "h-10 w-10",
  },
}

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variantClasses = buttonVariants.variant[variant] || buttonVariants.variant.default;
  const sizeClasses = buttonVariants.size[size] || buttonVariants.size.default;

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses} ${sizeClasses} ${className || ''}`}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }