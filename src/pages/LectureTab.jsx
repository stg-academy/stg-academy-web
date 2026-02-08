import LectureTable from "../components/tables/LectureTable.jsx";
import {createLecture, deleteLecture, updateLecture} from "../services/lectureService.js";
import {useState} from "react";

const LectureTab = ({
                        onError,
                        lectures,
                        sessionId,
                        loading,
                        onRefresh
                    }) => {
    // 인라인 편집 상태
    const [editingLectureId, setEditingLectureId] = useState(null)
    const [editingData, setEditingData] = useState({})
    const [validationErrors, setValidationErrors] = useState({})


    // 인라인 편집 시작
    const handleStartEdit = (lecture) => {
        setEditingLectureId(lecture.id)
        setEditingData({
            ...(lecture.title && {title: lecture.title}),
            ...(lecture.lecture_date && {lecture_date: lecture.lecture_date.split('T')[0]}),
            ...(lecture.attendance_type && {attendance_type: lecture.attendance_type})
        })
    }

    // 인라인 편집 취소
    const handleCancelEdit = () => {
        setEditingLectureId(null)
        setEditingData({})
        setValidationErrors({})
    }

    // 인라인 편집 데이터 변경
    const handleEditChange = (field, value) => {
        setEditingData(prev => ({
            ...prev,
            [field]: value
        }))

        // 필드 변경 시 해당 필드의 오류 제거
        if (validationErrors[field]) {
            setValidationErrors(prev => {
                const newErrors = {...prev}
                delete newErrors[field]
                return newErrors
            })
        }
    }

    // 유효성 검사 함수
    const validateLectureData = (data) => {
        const errors = {}

        if (!data.title || data.title.trim() === '') {
            errors.title = '강의명은 필수 입력 항목입니다.'
        }

        if (!data.lecture_date || data.lecture_date.trim() === '') {
            errors.lecture_date = '강의 일시는 필수 입력 항목입니다.'
        }

        return errors
    }

    // 변경 사항이 있는지 확인
    const hasChanges = (original, edited) => {
        for (const key in edited) {
            if (edited[key] !== original[key] && !(edited[key] == null && original[key] === '')) {
                return true
            }
        }
        return false
    }

    // 인라인 편집 저장
    const handleSaveEdit = async (lectureId) => {
        // 유효성 검사 수행
        const errors = validateLectureData(editingData)

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            return // 오류가 있으면 저장하지 않음
        }

        if (!hasChanges(lectures.find(lecture => lecture.id === lectureId), editingData)) {
            setEditingLectureId(null)
            setEditingData({})
            setValidationErrors({})
            return // 변경 사항이 없으면 저장하지 않음
        }

        try {
            await updateLecture(lectureId, editingData)
            await onRefresh() // 목록 새로고침
            setEditingLectureId(null)
            setEditingData({})
            setValidationErrors({})
        } catch (err) {
            console.error('강의 수정 실패:', err)
            onError('강의 수정에 실패했습니다')
        }
    }

    // 새 강의 추가
    const handleAddLecture = async () => {
        try {
            const newLectureData = {
                session_id: sessionId,
                title: `${lectures.length + 1}강`,
                sequence: lectures.length + 1
            }
            await createLecture(newLectureData)
            await onRefresh() // 목록 새로고침
        } catch (err) {
            console.error('강의 생성 실패:', err)
            onError('강의 생성에 실패했습니다')
        }
    }

    // 강의 삭제
    const handleDeleteLecture = async (lectureId) => {
        if (confirm('정말 이 강의를 삭제하시겠습니까?')) {
            try {
                await deleteLecture(lectureId)
                await onRefresh() // 목록 새로고침
            } catch (err) {
                console.error('강의 삭제 실패:', err)
                onError('강의 삭제에 실패했습니다')
            }
        }
    }


    return <div className="bg-white rounded-lg shadow">
        <LectureTable
            lectures={lectures}
            loading={loading}
            onDeleteLecture={handleDeleteLecture}
            // 인라인 편집 관련 props
            editingLectureId={editingLectureId}
            editingData={editingData}
            onStartEdit={handleStartEdit}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleSaveEdit}
            onEditChange={handleEditChange}
            // 유효성 검사 관련 props
            validationErrors={validationErrors}
        />

        {/* 새 강의 추가하기 */}
        <div className="px-6 py-4 border-t border-gray-200">
            <button
                onClick={handleAddLecture}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 4v16m8-8H4"/>
                </svg>
                <span className="text-sm font-medium">새 강의 추가하기</span>
            </button>
        </div>

        {/* 푸터 노트 */}
        <div className="px-6 py-4 bg-gray-50 text-xs text-gray-500 space-y-1">
            <p>* 관리자를 위한 도움말이 들어갈 예정입니다. 각 강의의 출석률과 자료 관리는 이곳에서 진행하세요.</p>
            <p>* 강의 일시 변경 시 수강생들에게 자동으로 알림이 발송됩니다.</p>
        </div>
    </div>
}

export default LectureTab;