const dotClasses = {
    info: 'bg-info',
    success: 'bg-success',
    error: 'bg-error',
    warning: 'bg-warning',
}

// Presentational only — stacking/positioning/auto-dismiss lives in ToastProvider.
const Toast = ({ tone = 'info', title, description }) => (
    <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white shadow-lg px-4 py-3.5 w-80">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotClasses[tone] || dotClasses.info}`} />
        <div className="min-w-0">
            <p className="text-[13px] font-semibold text-neutral-900">{title}</p>
            {description && <p className="mt-0.5 text-xs text-neutral-500">{description}</p>}
        </div>
    </div>
)

export default Toast
