import { Link } from 'react-router-dom'

// Desktop underline tab header. Pass `tabs` items with either a `to` (renders
// a Link, e.g. nested-route tabs) or rely on `onChange`/`active` (renders a
// button, e.g. same-page tab-switching) — mixing both in one list is fine.
const TabNav = ({ tabs, active, onChange, className = '' }) => (
    <div className={`border-b border-neutral-200 ${className}`} role="tablist">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {tabs.map((tab) => {
                const isActive = tab.key === active
                const classes = `flex-shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                        ? 'border-accent text-accent'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`
                if (tab.to) {
                    return (
                        <Link key={tab.key} to={tab.to} role="tab" aria-selected={isActive} className={classes}>
                            {tab.label}
                        </Link>
                    )
                }
                return (
                    <button
                        key={tab.key}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange?.(tab.key)}
                        className={classes}
                    >
                        {tab.label}
                    </button>
                )
            })}
        </nav>
    </div>
)

export default TabNav
