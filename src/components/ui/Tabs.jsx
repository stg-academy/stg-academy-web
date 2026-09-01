import { createContext, forwardRef, useContext, useState } from 'react'

const TabsContext = createContext({})

const Tabs = ({ value, defaultValue, onValueChange, children, ...props }) => {
    const [internalValue, setInternalValue] = useState(defaultValue)
    const currentValue = value !== undefined ? value : internalValue

    const handleValueChange = (newValue) => {
        if (value === undefined) {
            setInternalValue(newValue)
        }
        onValueChange?.(newValue)
    }

    return (
        <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
            <div {...props}>{children}</div>
        </TabsContext.Provider>
    )
}

const TabsList = forwardRef(({ className = '', ...props }, ref) => (
    <div
        ref={ref}
        className={`inline-flex h-12 items-center justify-center rounded-lg bg-neutral-100 p-1 text-neutral-500 w-full ${className}`}
        {...props}
    />
))
TabsList.displayName = 'TabsList'

const TabsTrigger = forwardRef(({ className = '', value, children, ...props }, ref) => {
    const { value: currentValue, onValueChange } = useContext(TabsContext)
    const isActive = currentValue === value

    return (
        <button
            ref={ref}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 h-full ${
                isActive ? 'bg-white text-accent shadow-sm' : 'text-neutral-500'
            } ${className}`}
            onClick={() => onValueChange(value)}
            {...props}
        >
            {children}
        </button>
    )
})
TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = forwardRef(({ className = '', value, children, ...props }, ref) => {
    const { value: currentValue } = useContext(TabsContext)
    if (currentValue !== value) return null

    return (
        <div
            ref={ref}
            className={`mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${className}`}
            {...props}
        >
            {children}
        </div>
    )
})
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
