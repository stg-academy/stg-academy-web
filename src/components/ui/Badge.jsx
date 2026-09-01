const toneClasses = {
    neutral: 'bg-neutral-100 text-neutral-700',
    info: 'bg-info-soft text-info-text',
    success: 'bg-success-soft text-success-text',
    error: 'bg-error-soft text-error-text',
    warning: 'bg-warning-soft text-warning-text',
}

const Badge = ({ tone = 'neutral', className = '', children }) => (
    <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${toneClasses[tone] || toneClasses.neutral} ${className}`}
    >
        {children}
    </span>
)

export default Badge
