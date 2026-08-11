import { forwardRef } from 'react'

// No v2 spec exists for this component (gap in v2's coverage) — restyled with
// v2's accent/neutral tokens in place, architecture unchanged.
const Progress = forwardRef(({ className = '', value = 0, ...props }, ref) => (
    <div
        ref={ref}
        className={`relative h-2 w-full overflow-hidden rounded-full bg-neutral-100 ${className}`}
        {...props}
    >
        <div
            className="h-full w-full flex-1 bg-accent transition-all"
            style={{ transform: `translateX(-${100 - Math.min(100, Math.max(0, value))}%)` }}
        />
    </div>
))
Progress.displayName = 'Progress'

export default Progress
