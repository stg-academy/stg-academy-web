import {useCallback, useEffect, useMemo, useState} from 'react'
import {ATTENDANCE_CONFIG, getAttendanceStyle, getAttendanceTooltip} from '../../utils/attendanceStatus'

/**
 * 날짜를 "9/10" 형식으로 포맷팅
 * @param {Date|string} date - Date 객체 또는 문자열
 * @returns {string} 포맷된 날짜 문자열
 */
const formatDate = (date) => {
    if (!date) return ''
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) return ''
    return `${dateObj.getMonth() + 1}/${dateObj.getDate()}`
}

/**
 * 출석부 테이블 컴포넌트
 */
const AttendanceTable = ({
                             attendances = [],
                             lectures = [],
                             enrolls = [],
                             onCellClick,
                             onBulkEdit,
                             loading = false,
                             cellUpdateLoading = false,
                             className = '',
                             isMultiSelectMode = false,
                             onMultiSelectModeChange
                         }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [sortConfig, setSortConfig] = useState({key: null, direction: 'asc'})
    const [hoveredCell, setHoveredCell] = useState(null)
    // const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
    const [selectedCells, setSelectedCells] = useState(new Set())

    // enrolls를 기반으로 사용자 매트릭스 구성, attendances로 출석 데이터 매핑
    const processedData = useMemo(() => {
        if (!enrolls || enrolls.length === 0) return []

        // 1. 출석 데이터를 사용자ID-강의ID로 매핑
        const attendanceMap = {}
        attendances.forEach(attendance => {
            const userId = attendance.user_id || attendance.student_id
            const lectureId = attendance.lecture_id
            const key = `${userId}-${lectureId}`
            attendanceMap[key] = attendance
        })

        // 2. 수강생 목록을 기반으로 매트릭스 구성
        const userGroups = enrolls.map(enroll => {
            const userId = enroll.user_id || enroll.id
            const userName = enroll.user_name || `사용자_${userId?.substring(0, 4) || 'unknown'}`

            // 강의별 출석 정보 매핑
            const attendanceByLecture = {}
            lectures.forEach(lecture => {
                const key = `${userId}-${lecture.id}`
                attendanceByLecture[lecture.id] = attendanceMap[key] || null
            })

            return {
                user: {
                    id: userId,
                    name: userName,
                    class: enroll.user_class || ''
                },
                attendanceMap: attendanceByLecture
            }
        })

        return userGroups
    }, [enrolls, attendances, lectures])

    // 검색 및 정렬된 데이터
    const filteredAndSortedData = useMemo(() => {
        let filtered = processedData

        // 검색 필터링
        if (searchTerm) {
            filtered = filtered.filter(userGroup => {
                const name = userGroup.user?.name || ''
                const className = userGroup.user?.class || ''
                const searchLower = searchTerm.toLowerCase()

                return name.toLowerCase().includes(searchLower) ||
                    className.toLowerCase().includes(searchLower)
            })
        }

        // 정렬
        if (sortConfig.key === 'name') {
            filtered = [...filtered].sort((a, b) => {
                const aName = a.user?.name || ''
                const bName = b.user?.name || ''

                return sortConfig.direction === 'asc'
                    ? aName.localeCompare(bName, 'ko-KR')
                    : bName.localeCompare(aName, 'ko-KR')
            })
        }

        return filtered
    }, [processedData, searchTerm, sortConfig])

    // 정렬 핸들러
    const handleSort = (key) => {
        if (key !== 'name') return
        setSortConfig(prevConfig => ({
            key: key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    // 정렬 아이콘
    const getSortIcon = (key) => {
        if (key !== 'name') return null
        if (sortConfig.key !== key) {
            return <span className="text-gray-400 ml-1">⇅</span>
        }
        return sortConfig.direction === 'asc'
            ? <span className="text-blue-600 ml-1">↑</span>
            : <span className="text-blue-600 ml-1">↓</span>
    }

    // 셀 클릭 핸들러
    const handleCellClick = useCallback((userGroup, lecture, attendance) => {
        if (cellUpdateLoading) return

        if (isMultiSelectMode) {
            const cellKey = `${userGroup.user?.id}-${lecture.id}`
            setSelectedCells(prev => {
                const newSelected = new Set(prev)
                if (newSelected.has(cellKey)) {
                    newSelected.delete(cellKey)
                } else {
                    newSelected.add(cellKey)
                }
                return newSelected
            })
            return
        }

        if (!onCellClick) return

        const cellInfo = {
            userName: userGroup.user?.name,
            userClass: userGroup.user?.class,
            userId: userGroup.user?.id,
            lectureId: lecture.id,
            lectureTitle: lecture.title,
            attendance: attendance
        }

        onCellClick(cellInfo)
    }, [onCellClick, cellUpdateLoading, isMultiSelectMode])

    // 셀 호버 핸들러
    const handleCellMouseEnter = useCallback((userIndex, lectureIndex) => {
        if (!cellUpdateLoading) {
            setHoveredCell({userIndex, lectureIndex})
        }
    }, [cellUpdateLoading])

    const handleCellMouseLeave = useCallback(() => {
        setHoveredCell(null)
    }, [])

    const isCellHovered = useCallback((userIndex, lectureIndex) => {
        return hoveredCell?.userIndex === userIndex && hoveredCell?.lectureIndex === lectureIndex
    }, [hoveredCell])

    // 모드 변경 시 선택 상태 초기화
    useEffect(() => {
        setSelectedCells(new Set())
    }, [isMultiSelectMode])

    // 다중 선택 모드 토글
    const toggleMultiSelectMode = useCallback(() => {
        onMultiSelectModeChange(prev => !prev)
        setSelectedCells(new Set()) // 모드 변경 시 선택 초기화
    }, [])

    // 선택된 셀들로 일괄 편집 데이터 생성
    const getSelectedCellsData = useCallback(() => {
        const selectedData = []

        filteredAndSortedData.forEach(userGroup => {
            lectures.forEach(lecture => {
                const cellKey = `${userGroup.user?.id}-${lecture.id}`
                if (selectedCells.has(cellKey)) {
                    const attendance = userGroup.attendanceMap[lecture.id]
                    selectedData.push({
                        userName: userGroup.user?.name,
                        userClass: userGroup.user?.class,
                        userId: userGroup.user?.id,
                        lectureId: lecture.id,
                        lectureTitle: lecture.title,
                        attendance: attendance
                    })
                }
            })
        })

        return selectedData
    }, [selectedCells, filteredAndSortedData, lectures])

    // 일괄 편집 핸들러
    const handleBulkEdit = useCallback(() => {
        if (!onBulkEdit || selectedCells.size === 0) return

        const selectedData = getSelectedCellsData()
        onBulkEdit(selectedData)
    }, [onBulkEdit, selectedCells.size, getSelectedCellsData])

    // 셀이 선택되었는지 확인
    const isCellSelected = useCallback((userGroup, lecture) => {
        const cellKey = `${userGroup.user?.id}-${lecture.id}`
        return selectedCells.has(cellKey)
    }, [selectedCells])

    // 로딩 상태
    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">📋 출석부</h3>
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
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                        <span>출석부</span>
                        {cellUpdateLoading && (
                            <span className="text-sm text-blue-600 animate-pulse">저장 중...</span>
                        )}
                    </h3>

                    <div className="flex items-center space-x-4">
                        {/* 다중 선택 및 일괄 편집 버튼들 */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={toggleMultiSelectMode}
                                disabled={cellUpdateLoading}
                                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                                    isMultiSelectMode
                                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isMultiSelectMode ? '선택 완료' : '다중 선택'}
                            </button>

                            {isMultiSelectMode && (
                                <button
                                    onClick={handleBulkEdit}
                                    disabled={cellUpdateLoading || selectedCells.size === 0}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                                        selectedCells.size > 0
                                            ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                                            : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                                    } disabled:opacity-50`}
                                >
                                    일괄 수정 ({selectedCells.size})
                                </button>
                            )}
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="이름 또는 반 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-64"
                                disabled={cellUpdateLoading}
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600">
                            {searchTerm
                                ? `${filteredAndSortedData.length}개 검색 결과`
                                : `총 ${processedData.length}명`
                            }
                            {isMultiSelectMode && selectedCells.size > 0 && (
                                <span className="ml-2 text-blue-600 font-medium">
                                    • {selectedCells.size}개 선택됨
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 테이블 컨테이너 */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    {/* 테이블 헤더 */}
                    <thead className="bg-gray-50">
                    <tr>
                        {/* 이름 컬럼 */}
                        <th
                            onClick={() => handleSort('name')}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none border-r border-gray-200"
                        >
                            <div className="flex items-center">
                                <span>이름</span>
                                {getSortIcon('name')}
                            </div>
                        </th>

                        {/* 강의별 컬럼 */}
                        {lectures.map((lecture, index) => (
                            <th
                                key={lecture.id || index}
                                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0 min-w-[90px]"
                            >
                                <div className="flex flex-col items-center space-y-1">
                                    <span>{lecture.sequence || `${index + 1}강`}</span>
                                    <span className="text-xs text-gray-400 font-normal">
                                        {formatDate(lecture.lecture_date)}
                                    </span>
                                </div>
                            </th>
                        ))}
                    </tr>
                    </thead>

                    {/* 테이블 바디 */}
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedData.length === 0 ? (
                        <tr>
                            <td colSpan={lectures.length + 2} className="px-6 py-12 text-center text-gray-500">
                                {searchTerm ? (
                                    <div>
                                        <div className="font-medium mb-1">검색 결과가 없습니다</div>
                                        <div className="text-sm">다른 검색어를 입력해보세요</div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="font-medium mb-1">등록된 출석 정보가 없습니다</div>
                                        <div className="text-sm">학생을 추가하고 출석을 체크해보세요</div>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ) : (
                        filteredAndSortedData.map((userGroup, userIndex) => (
                            <tr key={userGroup.user?.id || userIndex} className="hover:bg-gray-50 transition-colors">
                                {/* 이름 셀 */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">
                                    {userGroup.user?.name || '-'}
                                </td>

                                {/* 출석 상태 셀들 */}
                                {lectures.map((lecture, lectureIndex) => {
                                    const attendance = userGroup.attendanceMap[lecture.id]
                                    const status = attendance?.detail_type || 'None'
                                    const style = getAttendanceStyle(status)
                                    const config = ATTENDANCE_CONFIG[status]

                                    const displayContent = config?.label || '-'
                                    const isHovered = isCellHovered(userIndex, lectureIndex)
                                    const isClickable = !cellUpdateLoading
                                    const isSelected = isMultiSelectMode && isCellSelected(userGroup, lecture)

                                    return (
                                        <td
                                            key={lecture.id || lectureIndex}
                                            className="px-4 py-4 whitespace-nowrap text-sm text-center border-r border-gray-100 last:border-r-0 relative"
                                        >
                                            <div
                                                className={`
                                                    ${style.className}
                                                    max-w-[80px] truncate mx-auto py-1 px-2 rounded
                                                    ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                                                    ${isHovered && isClickable ? `${style.bgClassName} border ${style.borderClassName}` : ''}
                                                    ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                                                    ${cellUpdateLoading ? 'opacity-50' : ''}
                                                    transition-all duration-150
                                                    relative
                                                `}
                                                title={
                                                    isClickable
                                                        ? isMultiSelectMode
                                                            ? '클릭하여 선택/해제'
                                                            : getAttendanceTooltip(attendance)
                                                        : '저장 중...'
                                                }
                                                onClick={() => isClickable && handleCellClick(userGroup, lecture, attendance)}
                                                onMouseEnter={() => isClickable && handleCellMouseEnter(userIndex, lectureIndex)}
                                                onMouseLeave={() => isClickable && handleCellMouseLeave()}
                                            >
                                                {isMultiSelectMode && isSelected && (
                                                    <div
                                                        className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                                                        ✓
                                                    </div>
                                                )}
                                                {displayContent}
                                            </div>
                                        </td>
                                    )
                                })}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AttendanceTable