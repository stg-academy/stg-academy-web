import React, {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useAuth} from '../contexts/AuthContext'
import {getSession} from '../services/sessionService'
import {getLecturesBySession} from '../services/lectureService'
import {getEnrollsBySession} from '../services/enrollService'
import SessionStatusBadge from "../components/SessionStatusBadge.jsx";
import AttendanceTab from "./AttendanceTab.jsx";
import LectureTab from "./LectureTab.jsx";
import EnrollTab from "./EnrollTab.jsx";

const SessionDetailPage = () => {
    const {sessionId} = useParams()
    const navigate = useNavigate()
    const {user} = useAuth()

    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState(null)
    const [activeTab, setActiveTab] = useState('lectures')
    const [lectures, setLectures] = useState([])
    const [lecturesLoading, setLecturesLoading] = useState(false)
    const [enrolls, setEnrolls] = useState([])
    const [enrollsLoading, setEnrollsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [todaysLecture, setTodaysLecture] = useState(null)

    // 강좌 데이터 로드
    useEffect(() => {
        loadSession()
    }, [sessionId])

    // 강의 목록 로드
    useEffect(() => {
        if (sessionId) {
            loadLectures()
            loadEnrolls()
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

    const loadSession = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getSession(sessionId)
            setSession(data)
        } catch (err) {
            console.error('강좌 조회 실패:', err)
            setError('강좌 정보를 불러오는데 실패했습니다')
        } finally {
            setLoading(false)
        }
    }

    // 뒤로가기
    const handleGoBack = () => {
        navigate(-1)
    }

    // 엑셀 내보내기
    const handleExportExcel = () => {
        alert('출석인원 엑셀 내보내기 기능') // todo: handleExportExcel 구현 필요
    }

    // 키오스크 출석체크로 이동
    const handleKioskAttendance = () => {
        navigate(`/sessions/${sessionId}/attendance/kiosk`)
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
                <div className="text-gray-500">강좌을 찾을 수 없습니다.</div>
            </div>
        )
    }

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
                            <span>수강생 {enrolls ? enrolls.filter(e => e.enroll_status === "ACTIVE").length : 0} 명</span>{/* todo: totalStudents 추가 */}
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
                            강좌 설정
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
                                onClick={() => setActiveTab('attendances')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'attendances'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                출석부
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
                            <button
                                onClick={() => setActiveTab('kiosk')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'kiosk'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                키오스크 출석체크
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

                {/* 키오스크 출석체크 탭 */}
                {activeTab === 'kiosk' && (
                    <div className="bg-white rounded-lg shadow p-8">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">키오스크 출석체크</h3>

                            {todaysLecture ? (
                                <div className="mb-6">
                                    <div className="inline-flex items-center px-3 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        오늘 진행 강의 있음
                                    </div>
                                    <p className="text-gray-600 mb-2">
                                        <strong>{todaysLecture.title}</strong>
                                    </p>
                                    <p className="text-sm text-gray-500 mb-6">
                                        {new Date(todaysLecture.lecture_date).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            weekday: 'long'
                                        })}
                                    </p>
                                    <button
                                        onClick={handleKioskAttendance}
                                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        키오스크 출석체크 시작
                                    </button>
                                </div>
                            ) : (
                                <div className="mb-6">
                                    <div className="inline-flex items-center px-3 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-4">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        오늘 진행 강의 없음
                                    </div>
                                    <p className="text-gray-500 mb-6">오늘 예정된 강의가 없어 키오스크 출석체크를 사용할 수 없습니다.</p>
                                    <button
                                        disabled
                                        className="inline-flex items-center px-6 py-3 bg-gray-300 text-gray-500 font-medium rounded-lg cursor-not-allowed"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        키오스크 출석체크 시작
                                    </button>
                                </div>
                            )}

                            <div className="text-left bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-blue-900 mb-2">키오스크 출석체크 안내</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• 수강생들이 직접 이름을 검색하여 출석체크할 수 있습니다</li>
                                    <li>• 한글 초성 검색이 가능하여 빠른 검색이 가능합니다</li>
                                    <li>• 터치스크린에 최적화된 큰 버튼으로 구성되어 있습니다</li>
                                    <li>• 실시간으로 출석 현황을 확인할 수 있습니다</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default SessionDetailPage