import * as React from "react"

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "",
    secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
    outline: "text-slate-900 border-slate-200",
    blue: "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200",
    green: "border-transparent bg-green-100 text-green-700 hover:bg-green-200",
    gray: "border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200",
  }

  const variantClasses = variants[variant] || variants.default;

  return (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap ${variantClasses} ${className || ''}`}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }