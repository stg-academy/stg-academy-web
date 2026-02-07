import {useState, useEffect} from 'react'
import {useAuth} from '../contexts/AuthContext'
import CourseTable from '../components/tables/CourseTable'
import LectureTable from '../components/tables/LectureTable'
import CourseModal from '../components/CourseModal'
import {getCourses, createCourse, updateCourse} from '../services/courseService'

const CoursePage = () => {
    const {user} = useAuth()
    const [loading, setLoading] = useState(true)
    const [courses, setCourses] = useState([])
    const [activeTab, setActiveTab] = useState('courses') // 'courses' or 'lectures'
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState(null)
    const [error, setError] = useState(null)

    // 코스 목록 로드
    useEffect(() => {
        loadCourses()
    }, [])

    const loadCourses = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getCourses()
            setCourses(data)
        } catch (err) {
            console.error('코스 목록 로드 실패:', err)
            setError('코스 목록을 불러오는데 실패했습니다')
        } finally {
            setLoading(false)
        }
    }

    // 코스 개설 모달 열기
    const handleOpenCreateModal = () => {
        setEditingCourse(null)
        setIsModalOpen(true)
    }

    // 코스 수정 모달 열기
    const handleOpenEditModal = (course) => {
        setEditingCourse(course)
        setIsModalOpen(true)
    }

    // 모달 닫기
    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingCourse(null)
    }

    // 코스 저장 (생성 또는 수정)
    const handleSaveCourse = async (courseData) => {
        try {
            if (editingCourse) {
                // 수정
                await updateCourse(editingCourse.id, courseData)
            } else {
                // 생성
                await createCourse(courseData)
            }

            // 목록 새로고침
            await loadCourses()
        } catch (err) {
            throw err // 모달에서 에러 처리
        }
    }

    // 강좌수 클릭 핸들러
    const handleLectureCountClick = (course) => {
        // todo: 강좌수 클릭 동작 추가
        console.log('강좌수 클릭:', course)
    }

    // 강좌 목록 (임시 데이터)
    const lectures = [
        {
            id: 1,
            title: '교리반 1주차',
            course: '교리반 1학기 (4학점, 신학)',
            author: '이영규',
            sessionCount: 4
        },
        {
            id: 2,
            title: '교리반 2주차',
            course: '교리반 2학기 (...)',
            author: '이영규',
            sessionCount: 2
        },
        {
            id: 3,
            title: '교리반 3주차',
            course: '교리반 3학기 (...)',
            author: '이영규',
            sessionCount: 0
        },
        {
            id: 4,
            title: '재차반 1주차',
            course: '재차반 1학기 성경설명',
            author: '이영규',
            sessionCount: 8
        }
    ]

    // 세션수 클릭 핸들러
    const handleSessionCountClick = (lecture) => {
        // todo: 세션수 클릭 동작 추가
        console.log('세션수 클릭:', lecture)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                {/* 페이지 헤더 */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">코스 관리</h2>
                </div>

                {/* 탭 네비게이션 */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('courses')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'courses'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                코스 목록
                            </button>
                            <button
                                onClick={() => setActiveTab('lectures')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'lectures'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                강좌 목록
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

                {/* 코스 목록 탭 */}
                {activeTab === 'courses' && (
                    <div>
                        <div className="mb-6 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">코스 목록</h3>
                            <button
                                onClick={handleOpenCreateModal}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 4v16m8-8H4"/>
                                </svg>
                                <span>코스 개설하기</span>
                            </button>
                        </div>

                        <CourseTable
                            courses={courses}
                            loading={loading}
                            onEditCourse={handleOpenEditModal}
                            onLectureCountClick={handleLectureCountClick}
                        />
                    </div>
                )}

                {/* 강좌 목록 탭 */}
                {activeTab === 'lectures' && (
                    <div>
                        <div className="mb-6 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">강좌 목록</h3>
                        </div>

                        <LectureTable
                            lectures={lectures}
                            loading={loading}
                            onSessionCountClick={handleSessionCountClick}
                        />
                    </div>
                )}
            </main>

            {/* 코스 생성/수정 모달 */}
            <CourseModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSaveCourse}
                editingCourse={editingCourse}
            />
        </div>
    )
}

export default CoursePage
