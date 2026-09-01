const ErrorBanner = ({ message, className = '' }) => {
    if (!message) return null
    return (
        <div className={`bg-error-soft border border-error/20 rounded-lg p-4 ${className}`}>
            <p className="text-sm text-error-text">{message}</p>
        </div>
    )
}

export default ErrorBanner
