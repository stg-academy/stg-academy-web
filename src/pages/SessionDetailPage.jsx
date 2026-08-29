import React, {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useAuth} from '../contexts/AuthContext'
import {getSession, updateSession, updateSessionCode} from '../services/sessionService'
import {getLecturesBySession} from '../services/lectureService'
import {getEnrollsBySession} from '../services/enrollService'
import {getAssistantsBySession} from '../services/assistantService'
import {getCourses} from '../services/courseService'
import SessionStatusBadge from "../components/SessionStatusBadge.jsx";
import SessionModal from "../components/modals/SessionModal.jsx";
import AttendanceTab from "./AttendanceTab.jsx";
import LectureTab from "./LectureTab.jsx";
import EnrollTab from "./EnrollTab.jsx";
import KioskTab from "./KioskTab.jsx";
import AssistantTab from "./AssistantTab.jsx";
import AttendanceCodeCard from "../components/AttendanceCodeCard.jsx";
import PageContainer from "../components/ui/PageContainer.jsx";
import TabNav from "../components/ui/TabNav.jsx";
import ErrorBanner from "../components/ui/ErrorBanner.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import Button from "../components/ui/Button.jsx";
import {useToast} from "../components/ui/ToastProvider.jsx";
import Icon from "../components/ui/Icon.jsx";

const SessionDetailPage = () => {
    const {sessionId} = useParams()
    const navigate = useNavigate()
    const {user} = useAuth()
    const toast = useToast()

    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState(null)
    const [activeTab, setActiveTab] = useState('lectures')
    const [lectures, setLectures] = useState([])
    const [lecturesLoading, setLecturesLoading] = useState(false)
    const [enrolls, setEnrolls] = useState([])
    const [enrollsLoading, setEnrollsLoading] = useState(false)
    const [assistants, setAssistants] = useState([])
    const [assistantsLoading, setAssistantsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [todaysLecture, setTodaysLecture] = useState(null)
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
    const [courses, setCourses] = useState([])

    // 강좌 데이터 로드
    useEffect(() => {
        loadSession()
        loadCourses()
    }, [sessionId])

    // 강의 목록 로드
    useEffect(() => {
        if (sessionId) {
            loadLectures()
            loadEnrolls()
            loadAssistants()
        }
    }, [sessionId])

    const loadLectures = async () => {
        try {
            setLecturesLoading(true)
            const data = await getLecturesBySession(sessionId)
            setLectures(data)

            // 오늘 강의 찾기
            const today = new Date().toISOString().split('T')[0]
            const todayLecture = data.find(lecture => {
                if (lecture.lecture_date) {
                    const lectureDate = new Date(lecture.lecture_date).toISOString().split('T')[0]
                    return lectureDate === today
                }
                return false
            })
            setTodaysLecture(todayLecture || null)
        } catch (err) {
            console.error('강의 목록 조회 실패:', err)
            setError('강의 목록을 불러오는데 실패했습니다')
        } finally {
            setLecturesLoading(false)
        }
    }

    const loadEnrolls = async () => {
        try {
            setEnrollsLoading(true)
            const data = await getEnrollsBySession(sessionId)
            setEnrolls(data)
        } catch (err) {
            console.error('수강생 목록 조회 실패:', err)
            setError('수강생 목록을 불러오는데 실패했습니다')
        } finally {
            setEnrollsLoading(false)
        }
    }

    const loadAssistants = async () => {
        try {
            setAssistantsLoading(true)
            const data = await getAssistantsBySession(sessionId)
            setAssistants(data)
        } catch (err) {
            console.error('조교 목록 조회 실패:', err)
            setError('조교 목록을 불러오는데 실패했습니다')
        } finally {
            setAssistantsLoading(false)
        }
    }

    const loadSession = async (silent = false) => {
        try {
            if (!silent) setLoading(true)
            setError(null)
            const data = await getSession(sessionId)
            setSession(data)
        } catch (err) {
            console.error('강좌 조회 실패:', err)
            setError(err.status === 404 ? '존재하지 않는 강좌입니다' : '강좌 정보를 불러오는데 실패했습니다')
        } finally {
            if (!silent) setLoading(false)
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

    // 강좌 설정 저장
    const handleSaveSession = async (sessionData) => {
        await updateSession(sessionId, sessionData)
        await loadSession(true)
    }

    // 뒤로가기
    const handleGoBack = () => {
        navigate(-1)
    }

    // 엑셀 내보내기
    const handleExportExcel = () => {
        toast.info('출석인원 엑셀 내보내기 기능') // todo: handleExportExcel 구현 필요
    }

    // 출석 코드 새로고침
    const handleRefreshCode = async () => {
        try {
            setLoading(true)
            setError(null)
            // 출석 인증코드 새로고침 API 호출
            await updateSessionCode(sessionId)
            // 세션 정보 다시 불러오기
            await loadSession()
        } catch (err) {
            console.error('출석 코드 새로고침 실패:', err)
            setError('출석 코드 새로고침에 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }


    if (loading) {
        return <LoadingState variant="fullscreen" label="로딩 중..." />
    }

    if (!session) {
        return <LoadingState variant="fullscreen" label="강좌을 찾을 수 없습니다." />
    }

    const tabs = [
        {key: 'lectures', label: '강의 목록'},
        {key: 'students', label: '수강생'},
        {key: 'attendances', label: '출석부'},
        {key: 'kiosk', label: '현장 출석체크'},
        {key: 'assistants', label: '조교 관리'},
        {key: 'googleSheet', label: '구글시트 관리'},
    ]

    return (
        <PageContainer>
            {/* 뒤로가기 버튼 */}
            <button
                onClick={handleGoBack}
                className="flex items-center text-neutral-600 hover:text-neutral-900 mb-4 transition-colors"
            >
                <Icon name="chevron-left" size={20} className="mr-1" />
                <span className="text-sm">돌아가기</span>
            </button>

            {/* 페이지 헤더 */}
            <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                    <div className="flex items-center flex-wrap gap-3 mb-3">
                        <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900">{session.title}</h2>
                        <SessionStatusBadge status={session.course_status}/>
                    </div>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
                        <span>{session.lecturer_info}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>총 {session.lecture_count} 회차</span>
                        <span className="hidden sm:inline">•</span>
                        <span>수강생 {enrolls ? enrolls.filter(e => e.enroll_status === "ACTIVE").length : 0} 명</span>{/* todo: totalStudents 추가 */}
                    </div>
                </div>

                <div className="flex items-center flex-wrap gap-3">
                    <AttendanceCodeCard
                        attendanceCode={session.attendance_code}
                        onRefreshCode={handleRefreshCode}
                    />
                    {/* todo: 구현   */}
                    <Button onClick={handleExportExcel} size="sm" disabled>
                        출석인원 내보내기(엑셀)
                    </Button>
                    <Button onClick={() => setIsSessionModalOpen(true)} variant="secondary" size="sm">
                        강좌 설정
                    </Button>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="mb-6">
                <TabNav tabs={tabs} active={activeTab} onChange={setActiveTab} />
            </div>

            <ErrorBanner message={error} className="mb-6" />

            {/* 강의 목록 탭 */}
                {activeTab === 'lectures' && (
                    <LectureTab
                        lectures={lectures}
                        sessionId={sessionId}
                        onError={setError}
                        onRefresh={loadLectures}
                        loading={loading}
                    />
                )}

                {/* 수강생 탭 */}
                {activeTab === 'students' && (
                    <EnrollTab
                        session={session}
                        enrolls={enrolls}
                        enrollsLoading={enrollsLoading}
                        onError={setError}
                        onRefreshEnrolls={loadEnrolls}
                        loading={loading}
                    />
                )}

                {/* 출석부 탭 */}
                {activeTab === 'attendances' && (
                    <AttendanceTab
                        session={session}
                        lectures={lectures}
                        enrolls={enrolls}
                        enrollsLoading={enrollsLoading}
                        loading={loading}
                        onError={setError}
                    />
                )}

                {/* 현장 출석체크 탭 */}
                {activeTab === 'kiosk' && (
                    <KioskTab
                        sessionId={sessionId}
                        todaysLecture={todaysLecture}
                    />
                )}

                {/* 조교 관리 탭 */}
                {activeTab === 'assistants' && (
                    <AssistantTab
                        session={session}
                        assistants={assistants}
                        assistantsLoading={assistantsLoading}
                        onError={setError}
                        onRefreshAssistants={loadAssistants}
                        loading={loading}
                    />
                )}

                {/* 구글시트 관리 탭 */}
                {activeTab === 'googleSheet' && (
                    <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
                        <p className="text-neutral-500">구글시트 관리 기능이 여기에 표시됩니다.</p>
                    </div>
                )}

            <SessionModal
                isOpen={isSessionModalOpen}
                onClose={() => setIsSessionModalOpen(false)}
                onSubmit={handleSaveSession}
                editingSession={session}
                courses={courses}
            />
        </PageContainer>
    )
}

export default SessionDetailPage