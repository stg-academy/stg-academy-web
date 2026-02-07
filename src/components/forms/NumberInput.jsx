const NumberInput = ({
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
    min,
    max,
    step
}) => {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                type="number"
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                min={min}
                max={max}
                step={step}
                className={`w-full px-4 py-3 border ${
                    error ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                disabled={disabled}
            />
            {description && (
                <p className="mt-1 text-xs text-gray-500">
                    {description}
                </p>
            )}
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    )
}

export default NumberInput