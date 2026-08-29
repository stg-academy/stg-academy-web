import Icon from './Icon.jsx'

// v2 스펙: 체크 시 accent 채움, 18x18, radius-sm
const Checkbox = ({ id, checked = false, onChange, label, disabled = false, error = false }) => {
    const boxClasses = disabled
        ? 'bg-neutral-100 border-neutral-200'
        : checked
            ? 'bg-accent border-accent'
            : error
                ? 'bg-white border-error'
                : 'bg-white border-neutral-300'

    return (
        <label
            htmlFor={id}
            className={`inline-flex items-center gap-2 text-sm ${
                disabled ? 'text-neutral-400 cursor-not-allowed' : 'text-neutral-700 cursor-pointer'
            }`}
        >
            <input
                id={id}
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange && onChange(e.target.checked)}
                className="sr-only"
            />
            <span className={`flex-none w-[18px] h-[18px] rounded-sm border-[1.5px] flex items-center justify-center transition-colors ${boxClasses}`}>
                {checked && !disabled && (
                    <Icon name="check" size={12} strokeWidth={3} className="text-white" />
                )}
            </span>
            {label}
        </label>
    )
}

export default Checkbox
