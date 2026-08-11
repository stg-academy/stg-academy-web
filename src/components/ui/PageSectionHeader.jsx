// In-page section header (title + action slot). For the page-level <h1>,
// style directly at the page-title scale (text-2xl font-bold) — this
// component is for section-title scale (18px/600) headers within a page.
const PageSectionHeader = ({ title, action, className = '' }) => (
    <div className={`mb-6 flex justify-between items-center ${className}`}>
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        {action}
    </div>
)

export default PageSectionHeader
