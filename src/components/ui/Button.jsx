import { forwardRef } from 'react'

const sizeClasses = {
    sm: 'h-8 px-3 text-[13px]',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
}

const variantClasses = {
    primary: 'bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50',
    secondary: 'bg-neutral-100 text-neutral-700 border-none hover:bg-neutral-200',
    danger: 'bg-error text-white border-none hover:bg-error/90',
    ghost: 'bg-transparent text-neutral-700 border-none hover:bg-neutral-100',
    link: 'bg-transparent text-accent border-none underline p-0 h-auto hover:text-accent-hover',
}

const Button = forwardRef(({ variant = 'primary', size = 'md', disabled = false, className = '', children, ...rest }, ref) => {
    const isLink = variant === 'link'
    return (
        <button
            ref={ref}
            disabled={disabled}
            className={`inline-flex items-center justify-center rounded-md font-semibold transition-colors active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:opacity-50 ${isLink ? '' : sizeClasses[size]} ${variantClasses[variant] || variantClasses.primary} ${className}`}
            {...rest}
        >
            {children}
        </button>
    )
})
Button.displayName = 'Button'

export default Button
