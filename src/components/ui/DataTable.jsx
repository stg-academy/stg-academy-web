import {useState, useMemo} from 'react'

const DataTable = ({
                       title = "데이터 테이블",
                       data = [],
                       columns = [],
                       searchableColumns = [],
                       loading = false,
                       itemsPerPage = null,
                       showPagination = true,
                       showSearch = true,
                       emptyMessage = "데이터가 없습니다.",
                       className = "",
                       // 인라인 편집 관련 props
                       editingRowId = null,
                       editingData = {},
                       onStartEdit = null,
                       onCancelEdit = null,
                       onSaveEdit = null,
                       onEditChange = null,
                       // 유효성 검사 관련 props
                       validationErrors = {},
                       // 푸터 관련 props
                       footer = null
                   }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [sortConfig, setSortConfig] = useState({key: null, direction: 'asc'})

    // 검색 필터링
    const filteredData = useMemo(() => {
        if (!searchTerm || !searchableColumns.length) return data

        return data.filter(row =>
            searchableColumns.some(column => {
                const value = row[column]
                if (value == null) return false
                return value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            })
        )
    }, [data, searchTerm, searchableColumns])

    // 정렬 기능
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key]
            const bValue = b[sortConfig.key]

            if (aValue == null && bValue == null) return 0
            if (aValue == null) return 1
            if (bValue == null) return -1

            let result = 0
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                result = aValue.localeCompare(bValue)
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                result = aValue - bValue
            } else {
                result = aValue.toString().localeCompare(bValue.toString())
            }

            return sortConfig.direction === 'desc' ? -result : result
        })
    }, [filteredData, sortConfig])

    // 페이지네이션 (itemsPerPage가 없으면 전체 데이터 표시)
    const totalPages = itemsPerPage ? Math.ceil(sortedData.length / itemsPerPage) : 1
    const startIndex = itemsPerPage ? (currentPage - 1) * itemsPerPage : 0
    const paginatedData = itemsPerPage ? sortedData.slice(startIndex, startIndex + itemsPerPage) : sortedData

    // 정렬 핸들러
    const handleSort = (key) => {
        if (!columns.find(col => col.key === key)?.sortable) return

        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    // 페이지 변경 핸들러
    const handlePageChange = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    // 검색어 변경 시 첫 페이지로 이동
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }

    // 편집 가능한 셀 렌더링
    const renderEditableCell = (row, column) => {
        const value = editingData[column.key] !== undefined ? editingData[column.key] : row[column.key] || ''
        const hasError = validationErrors[column.key]
        const inputClassName = `w-full -my-2 px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm ${
            hasError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
        }`

        const renderInput = () => {
            switch (column.editType) {
                case 'text':
                    return (
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onEditChange && onEditChange(column.key, e.target.value)}
                            className={inputClassName}
                            autoFocus={column.autoFocus}
                        />
                    )
                case 'select':
                    return (
                        <select
                            value={value}
                            onChange={(e) => onEditChange && onEditChange(column.key, e.target.value)}
                            className={inputClassName}
                        >
                            {column.options && column.options.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    )
                case 'date':
                    return (
                        <input
                            type="date"
                            value={value}
                            onChange={(e) => onEditChange && onEditChange(column.key, e.target.value)}
                            className={inputClassName}
                        />
                    )
                case 'number':
                    return (
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => onEditChange && onEditChange(column.key, e.target.value)}
                            className={inputClassName}
                        />
                    )
                default:
                    return (
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onEditChange && onEditChange(column.key, e.target.value)}
                            className={inputClassName}
                        />
                    )
            }
        }

        return (
            <div>
                {renderInput()}
                {hasError && (
                    <div className="-mb-2 mt-2 text-xs text-red-600">
                        {validationErrors[column.key]}
                    </div>
                )}
            </div>
        )
    }

    // 렌더링할 셀 값 결정
    const renderCellValue = (row, column) => {
        // 인라인 편집 모드인 경우
        if (editingRowId === row.id && column.editable) {
            return renderEditableCell(row, column)
        }

        if (column.render && typeof column.render === 'function') {
            return column.render(row[column.key], row, editingRowId === row.id)
        }
        return row[column.key] || column.default
    }

    // 정렬 아이콘 렌더링
    const renderSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                </svg>
            )
        }

        return sortConfig.direction === 'asc' ? (
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
            </svg>
        ) : (
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"/>
            </svg>
        )
    }

    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${className}`}>
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        총 {data.length}개 항목 {filteredData.length !== data.length && `(${filteredData.length}개 검색됨)`}
                    </p>
                </div>

                {/* 검색창 */}
                {showSearch && searchableColumns.length > 0 && (
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor"
                                 viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="검색..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => handleSearchChange({target: {value: ''}})}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none"
                                     stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                    column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                                }`}
                                onClick={() => column.sortable && handleSort(column.key)}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>{column.label}</span>
                                    {column.sortable && renderSortIcon(column.key)}
                                </div>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.length > 0 ? (
                        paginatedData.map((row, index) => {
                            const isEditing = editingRowId === row.id
                            return (
                                <tr
                                    key={row.id || index}
                                    className={`transition-colors ${
                                        isEditing
                                            ? 'bg-blue-50 border border-blue-200'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className={`px-6 py-4 text-sm text-gray-900 ${
                                                column.editable && isEditing
                                                    ? ''
                                                    : 'whitespace-nowrap'
                                            }`}
                                        >
                                            {renderCellValue(row, column)}
                                        </td>
                                    ))}
                                </tr>
                            )
                        })
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                                {searchTerm ? '검색 결과가 없습니다.' : emptyMessage}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            {showPagination && itemsPerPage && totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
                    <div className="text-sm text-gray-700">
            <span>
              {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedData.length)} / {sortedData.length}개 항목
            </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            이전
                        </button>

                        {/* 페이지 번호 */}
                        <div className="flex items-center space-x-1">
                            {Array.from({length: Math.min(totalPages, 5)}, (_, i) => {
                                let pageNumber
                                if (totalPages <= 5) {
                                    pageNumber = i + 1
                                } else if (currentPage <= 3) {
                                    pageNumber = i + 1
                                } else if (currentPage >= totalPages - 2) {
                                    pageNumber = totalPages - 4 + i
                                } else {
                                    pageNumber = currentPage - 2 + i
                                }

                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                            currentPage === pageNumber
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                )
                            })}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            다음
                        </button>
                    </div>
                </div>
            )}

            {/* 푸터 */}
            {footer &&
                <div className="px-6 py-4 bg-gray-50 text-xs text-gray-500 space-y-1">
                    {footer}
                </div>
            }
        </div>
    )
}

export default DataTable