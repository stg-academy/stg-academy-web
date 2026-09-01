import {useEffect, useState} from 'react'
import {getAttendanceOptions} from '../../utils/attendanceStatus'
import Button from '../ui/Button.jsx'

/**
 * 날짜를 "9/10" 형식으로 포맷팅
 */
const formatDate = (date) => {
    if (!date) return ''
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) return ''
    return `${dateObj.getMonth() + 1}/${dateObj.getDate()}`
}

const isToday = (date) => {
    if (!date) return false
    const d = new Date(date)
    const today = new Date()
    return d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
}

const STATUS_OPTIONS = getAttendanceOptions()

/**
 * 출석부 모바일 뷰 — 회차 선택 후 한 줄에서 바로 입력 (2a 패턴)
 * 데스크톱의 N-컬럼 그리드 대신, 한 번에 하나의 회차만 보여주고
 * 수강생별로 4단 상태 버튼을 탭하면 즉시 저장한다.
 */
const AttendanceTableMobile = ({
                                    lectures = [],
                                    userGroups = [],
                                    onQuickSetStatus,
                                    onBulkAbsent,
                                    cellUpdateLoading = false,
                                    className = ''
                                }) => {
    const [selectedLectureId, setSelectedLectureId] = useState(null)

    useEffect(() => {
        if (lectures.length === 0) {
            setSelectedLectureId(null)
            return
        }
        if (selectedLectureId && lectures.some(l => l.id === selectedLectureId)) return

        const todaysLecture = lectures.find(l => isToday(l.lecture_date))
        setSelectedLectureId((todaysLecture || lectures[0]).id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lectures])

    const selectedLecture = lectures.find(l => l.id === selectedLectureId)

    return (
        <div className={className}>
            {/* 회차 선택 */}
            <div className="px-5 pt-4 pb-3 border-b border-neutral-100">
                <div className="text-xs font-semibold tracking-wider text-neutral-400 mb-2">회차 선택</div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {lectures.map((lecture, index) => {
                        const active = lecture.id === selectedLectureId
                        return (
                            <button
                                key={lecture.id || index}
                                onClick={() => setSelectedLectureId(lecture.id)}
                                className={`flex-none min-w-[60px] px-3 py-2 rounded-md border flex flex-col items-center gap-0.5 ${
                                    active
                                        ? 'border-accent bg-accent-soft text-accent-hover'
                                        : 'border-neutral-200 text-neutral-600'
                                }`}
                            >
                                <span className="text-sm font-semibold">{lecture.sequence || `${index + 1}강`}</span>
                                <span className="text-xs opacity-75">{formatDate(lecture.lecture_date)}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* 요약 */}
            <div className="px-5 py-2.5 flex items-center justify-between border-b border-neutral-100">
                <span className="text-sm font-semibold text-neutral-900">
                    {selectedLecture ? (selectedLecture.title || `${selectedLecture.sequence}강`) : '강의 없음'}
                </span>
                <span className="text-xs text-neutral-500">총 {userGroups.length}명</span>
            </div>

            {/* 수강생 목록 */}
            <div className="divide-y divide-neutral-100">
                {userGroups.length === 0 || !selectedLectureId ? (
                    <div className="px-5 py-12 text-center text-sm text-neutral-500">수강생이 없습니다.</div>
                ) : (
                    userGroups.map((userGroup, index) => {
                        const attendance = userGroup.attendanceMap[selectedLectureId]
                        const currentStatus = attendance?.detail_type

                        return (
                            <div key={userGroup.user?.id || index} className="px-5 py-3 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-neutral-900">{userGroup.user?.name || '-'}</span>
                                        {userGroup.user?.class && (
                                            <span className="text-xs text-neutral-400">{userGroup.user.class}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    {STATUS_OPTIONS.map((opt) => {
                                        const active = currentStatus === opt.value
                                        return (
                                            <button
                                                key={opt.value}
                                                disabled={cellUpdateLoading}
                                                onClick={() => onQuickSetStatus && onQuickSetStatus({
                                                    userName: userGroup.user?.name,
                                                    userClass: userGroup.user?.class,
                                                    userId: userGroup.user?.id,
                                                    lectureId: selectedLectureId,
                                                    lectureTitle: selectedLecture?.title,
                                                    attendance
                                                }, opt.value)}
                                                className={`flex-1 h-10 rounded-md border text-xs font-semibold disabled:opacity-50 ${
                                                    active
                                                        ? 'border-accent bg-accent text-white'
                                                        : 'border-neutral-200 text-neutral-600'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })
                )}
                <div className="h-20" />
            </div>

            {/* 하단 고정 바 */}
            <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-5 py-3">
                <Button
                    onClick={onBulkAbsent}
                    disabled={cellUpdateLoading}
                    variant="danger"
                    className="w-full"
                >
                    일괄 결석처리
                </Button>
            </div>
        </div>
    )
}

export default AttendanceTableMobile
