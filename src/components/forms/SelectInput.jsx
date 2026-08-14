import Select from '../ui/Select.jsx'

const SelectInput = ({
    id,
    name,
    label,
    value,
    onChange,
    options = [],
    placeholder = '',
    required = false,
    disabled = false,
    error = '',
    description = ''
}) => {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-2">
                {label}
                {required && <span className="text-error ml-1">*</span>}
            </label>
            <Select
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                options={options}
                placeholder={placeholder}
                disabled={disabled}
                error={!!error}
            />
            {description && (
                <p className="mt-1 text-xs text-neutral-500">
                    {description}
                </p>
            )}
            {error && (
                <p className="mt-1 text-sm text-error">{error}</p>
            )}
        </div>
    )
}

export default SelectInput