// Text-style pagination: ‹ 이전  1 2 3  다음 ›
const Pagination = ({ current, total, onChange }) => {
    if (total <= 1) return null

    const pageNumbers = []
    if (total <= 5) {
        for (let i = 1; i <= total; i++) pageNumbers.push(i)
    } else if (current <= 3) {
        pageNumbers.push(1, 2, 3, 4, 5)
    } else if (current >= total - 2) {
        for (let i = total - 4; i <= total; i++) pageNumbers.push(i)
    } else {
        for (let i = current - 2; i <= current + 2; i++) pageNumbers.push(i)
    }

    return (
        <nav className="flex items-center space-x-7 text-sm font-medium">
            <button
                onClick={() => onChange(current - 1)}
                disabled={current === 1}
                className="text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-70"
            >
                ‹ 이전
            </button>
            <div className="flex items-center space-x-5">
                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        onClick={() => onChange(page)}
                        className={`transition-colors ${
                            current === page ? 'text-neutral-900 font-bold' : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>
            <button
                onClick={() => onChange(current + 1)}
                disabled={current === total}
                className="text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-70"
            >
                다음 ›
            </button>
        </nav>
    )
}

export default Pagination
