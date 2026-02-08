import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useAuth} from '../contexts/AuthContext'
import {getSession} from '../services/sessionService'
import {createLecture, deleteLecture, getLecturesBySession, updateLecture} from '../services/lectureService'
import LectureTable from '../components/tables/LectureTable'
import SessionStatusBadge from "../components/SessionStatusBadge.jsx";

const SessionDetailPage = () => {
    const {sessionId} = useParams()
    const navigate = useNavigate()
    const {user} = useAuth()

    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState(null)
    const [activeTab, setActiveTab] = useState('lectures')
    const [lectures, setLectures] = useState([])
    const [lecturesLoading, setLecturesLoading] = useState(false)
    const [error, setError] = useState(null)

    // 세션 데이터 로드
    useEffect(() => {
        loadSession()
    }, [sessionId])

    // 강의 목록 로드
    useEffect(() => {
        if (sessionId) {
            loadLectures()
        }
    }, [sessionId])

    const loadSession = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getSession(sessionId)
            setSession(data)
        } catch (err) {
            console.error('세션 조회 실패:', err)
            setError('세션 정보를 불러오는데 실패했습니다')
        } finally {
            setLoading(false)
        }
    }

    const loadLectures = async () => {
        try {
            setLecturesLoading(true)
            const data = await getLecturesBySession(sessionId)
            setLectures(data)
        } catch (err) {
            console.error('강의 목록 조회 실패:', err)
            setError('강의 목록을 불러오는데 실패했습니다')
        } finally {
            setLecturesLoading(false)
        }
    }

    // 뒤로가기
    const handleGoBack = () => {
        navigate(-1)
    }

    // 강의 수정
    const handleEditLecture = async (lecture) => {
        try {
            // API 호출하여 수정
            await updateLecture(lecture.id, lecture)
            await loadLectures() // 목록 새로고침
        } catch (err) {
            console.error('강의 수정 실패:', err)
            setError('강의 수정에 실패했습니다')
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
            await loadLectures() // 목록 새로고침
        } catch (err) {
            console.error('강의 생성 실패:', err)
            setError('강의 생성에 실패했습니다')
        }
    }

    // 강의 삭제
    const handleDeleteLecture = async (lectureId) => {
        if (confirm('정말 이 강의를 삭제하시겠습니까?')) {
            try {
                await deleteLecture(lectureId)
                await loadLectures() // 목록 새로고침
            } catch (err) {
                console.error('강의 삭제 실패:', err)
                setError('강의 삭제에 실패했습니다')
            }
        }
    }

    // 엑셀 내보내기
    const handleExportExcel = () => {
        alert('출석인원 엑셀 내보내기 기능') // todo: handleExportExcel 구현 필요
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">로딩 중...</div>
            </div>
        )
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">세션을 찾을 수 없습니다.</div>
            </div>
        )
    }

    console.log(session)
    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                {/* 뒤로가기 버튼 */}
                <button
                    onClick={handleGoBack}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                    </svg>
                    <span className="text-sm">돌아가기</span>
                </button>

                {/* 페이지 헤더 */}
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <div className="flex items-center space-x-3 mb-3">
                            <h2 className="text-3xl font-bold text-gray-900">{session.title}</h2>
                            <SessionStatusBadge status={session.course_status}/>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{session.lecturer_info}</span>
                            <span>•</span>
                            <span>총 {session.lecture_count} 회차</span>
                            <span>•</span>
                            <span>수강생 {session.totalStudents}명</span>{/* todo: totalStudents 추가 */}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleExportExcel}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                            출석인원 내보내기(엑셀)
                        </button>
                        <button
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                            세션 설정
                        </button>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('lectures')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'lectures'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                강의 목록
                            </button>
                            <button
                                onClick={() => setActiveTab('students')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'students'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                수강생
                            </button>
                            <button
                                onClick={() => setActiveTab('instructors')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'instructors'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                강사/관리자
                            </button>
                            <button
                                onClick={() => setActiveTab('googleSheet')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'googleSheet'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                구글시트 관리
                            </button>
                        </nav>
                    </div>
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* 강의 목록 탭 */}
                {activeTab === 'lectures' && (
                    <div className="bg-white rounded-lg shadow">
                        <LectureTable
                            lectures={lectures}
                            loading={lecturesLoading}
                            onEditLecture={handleEditLecture}
                            onDeleteLecture={handleDeleteLecture}
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
                )}

                {/* 수강생 탭 */}
                {activeTab === 'students' && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-500">수강생 목록이 여기에 표시됩니다.</p>
                    </div>
                )}

                {/* 강사/관리자 탭 */}
                {activeTab === 'instructors' && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-500">강사/관리자 목록이 여기에 표시됩니다.</p>
                    </div>
                )}

                {/* 구글시트 관리 탭 */}
                {activeTab === 'googleSheet' && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-500">구글시트 관리 기능이 여기에 표시됩니다.</p>
                    </div>
                )}
            </main>
        </div>
    )
}

export default SessionDetailPage