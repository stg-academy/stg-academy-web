import {useState, useEffect} from 'react'
import {useAuth} from '../contexts/AuthContext'
import SessionTable from '../components/tables/SessionTable.jsx'
import SessionModal from '../components/SessionModal'
import {getSessions, createSession, updateSession} from '../services/sessionService'
import {getCourses} from '../services/courseService'

const SessionListPage = () => {
    const {user} = useAuth()
    const [loading, setLoading] = useState(true)
    const [sessions, setSessions] = useState([])
    const [courses, setCourses] = useState([])
    const [error, setError] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingSession, setEditingSession] = useState(null)

    // 초기 데이터 로드
    useEffect(() => {
        loadSessions()
        loadCourses()
    }, [])

    const loadSessions = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getSessions()
            setSessions(data)
        } catch (err) {
            console.error('세션 목록 로드 실패:', err)
            setError('세션 목록을 불러오는데 실패했습니다')
        } finally {
            setLoading(false)
        }
    }

    const loadCourses = async () => {
        try {
            const data = await getCourses()
            setCourses(data)
        } catch (err) {
            console.error('코스 목록 로드 실패:', err)
        }
    }

    // 세션 생성 모달 열기
    const handleOpenCreateModal = () => {
        setEditingSession(null)
        setIsModalOpen(true)
    }

    // 세션 수정 모달 열기
    const handleEditSession = (session) => {
        setEditingSession(session)
        setIsModalOpen(true)
    }

    // 모달 닫기
    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingSession(null)
    }

    // 세션 저장 (생성 또는 수정)
    const handleSaveSession = async (sessionData) => {
        try {
            if (editingSession) {
                // 수정
                await updateSession(editingSession.id, sessionData)
            } else {
                // 생성
                await createSession(sessionData)
            }

            // 목록 새로고침
            await loadSessions()
        } catch (err) {
            throw err // 모달에서 에러 처리
        }
    }

    return (
        <div>
            {/* 에러 메시지 */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">전체 세션 목록</h3>
                <button
                    onClick={handleOpenCreateModal}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 4v16m8-8H4"/>
                    </svg>
                    <span>세션 생성하기</span>
                </button>
            </div>

            <SessionTable
                sessions={sessions}
                loading={loading}
                onEditSession={handleEditSession}
            />

            {/* 세션 생성/수정 모달 */}
            <SessionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSaveSession}
                editingSession={editingSession}
                courses={courses}
            />
        </div>
    )
}

export default SessionListPage