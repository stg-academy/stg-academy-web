const PageContainer = ({ minWidth = true, className = '', children }) => (
    <div className={`min-h-screen bg-neutral-50 ${minWidth ? 'min-w-[1024px]' : ''}`}>
        <main className={`max-w-7xl mx-auto px-6 py-8 ${className}`}>
            {children}
        </main>
    </div>
)

export default PageContainer
