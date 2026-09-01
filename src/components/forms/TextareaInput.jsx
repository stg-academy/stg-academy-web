const TextareaInput = ({
    id,
    name,
    label,
    value,
    onChange,
    placeholder = '',
    required = false,
    disabled = false,
    error = '',
    description = '',
    rows = 6
}) => {
    return (
        <div>
            <label htmlFor={id} className="block text-label font-medium text-neutral-700 mb-1.5">
                {label}
                {required && <span className="text-error ml-1">*</span>}
            </label>
            <textarea
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                disabled={disabled}
                className={`w-full px-3 py-2 rounded-md border text-sm outline-none transition-colors resize-none ${
                    disabled
                        ? 'bg-neutral-50 text-neutral-400 border-neutral-200 cursor-not-allowed'
                        : error
                            ? 'bg-white text-neutral-900 border-error'
                            : 'bg-white text-neutral-900 border-neutral-300 focus:border-info focus:shadow-[0_0_0_3px_var(--color-accent-soft)]'
                }`}
            />
            {description && !error && (
                <p className="mt-1.5 text-micro text-neutral-400">{description}</p>
            )}
            {error && (
                <p className="mt-1.5 text-micro text-error-text">{error}</p>
            )}
        </div>
    )
}

export default TextareaInput
