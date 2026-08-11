// Unifies the app's 5 fragmented loading styles (audit 1-8) into one
// component. `inline`/`fullscreen` show text; `spinner` shows the animate-spin
// ring used by DataTable/AttendanceTable. Sets aria-busy/aria-live so
// loading state reaches screen readers (audit 5-5).
const LoadingState = ({ variant = 'inline', label = '로딩 중...', className = '' }) => {
    if (variant === 'spinner') {
        return (
            <div className={`flex justify-center items-center py-12 ${className}`} aria-busy="true" aria-live="polite">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                <span className="sr-only">{label}</span>
            </div>
        )
    }

    if (variant === 'fullscreen') {
        return (
            <div
                className={`min-h-screen flex items-center justify-center text-neutral-500 ${className}`}
                aria-busy="true"
                aria-live="polite"
            >
                {label}
            </div>
        )
    }

    return (
        <div className={`flex justify-center items-center h-64 text-neutral-500 ${className}`} aria-busy="true" aria-live="polite">
            {label}
        </div>
    )
}

export default LoadingState
