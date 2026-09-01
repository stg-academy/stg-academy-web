const Card = ({ hover = false, footer, className = '', children }) => (
    <div
        className={`bg-white rounded-lg border border-neutral-200 p-5 ${hover ? 'transition-shadow hover:shadow-sm' : ''} ${className}`}
    >
        {children}
        {footer && (
            <div className="mt-4 pt-4 border-t border-neutral-100">
                {footer}
            </div>
        )}
    </div>
)

export default Card
