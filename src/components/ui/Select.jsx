import { useEffect, useRef, useState } from 'react'

const ChevronIcon = ({ open }) => (
    <svg
        className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180 text-accent' : 'text-neutral-400'}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
)

const CheckIcon = () => (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
)

// 커스텀 드롭다운 셀렉트. 네이티브 <select>와 달리 펼침 패널 스타일(선택 항목 배지, 체크마크)을
// 자유롭게 커스터마이징할 수 있어 v2 디자인 시스템의 select box 스펙을 그대로 구현한다.
const Select = ({
    id,
    name,
    value,
    onChange,
    options = [],
    placeholder = '',
    disabled = false,
    error = false,
    className = '',
}) => {
    const [open, setOpen] = useState(false)
    const containerRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false)
            }
        }
        const handleEscape = (event) => {
            if (event.key === 'Escape') setOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [])

    const allOptions = placeholder ? [{ value: '', label: placeholder }, ...options] : options
    const selected = allOptions.find(opt => opt.value === value)

    const handleSelect = (opt) => {
        setOpen(false)
        onChange && onChange({ target: { name, value: opt.value } })
    }

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                id={id}
                disabled={disabled}
                onClick={() => setOpen(o => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={`w-full h-10 px-3 flex items-center justify-between gap-2 rounded-md border bg-white text-sm text-left transition-colors ${
                    error ? 'border-error' : open ? 'border-accent shadow-[0_0_0_3px_var(--color-accent-soft)]' : 'border-neutral-300 hover:border-neutral-400'
                } ${disabled ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed hover:border-neutral-300' : 'cursor-pointer'}`}
            >
                <span className={`truncate ${selected && selected.value !== '' ? 'text-neutral-900' : 'text-neutral-400'}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronIcon open={open} />
            </button>

            {open && !disabled && (
                <div
                    role="listbox"
                    className="absolute z-20 mt-1.5 w-full max-h-60 overflow-auto rounded-md border border-neutral-200 bg-white p-1.5 shadow-lg"
                >
                    {allOptions.map((opt) => {
                        const isSelected = opt.value === value
                        return (
                            <div
                                key={opt.value}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => handleSelect(opt)}
                                className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded text-sm cursor-pointer ${
                                    isSelected
                                        ? 'bg-accent-soft text-accent-hover font-semibold'
                                        : 'text-neutral-700 hover:bg-neutral-50'
                                }`}
                            >
                                <span className="truncate">{opt.label}</span>
                                {isSelected && <CheckIcon />}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default Select
