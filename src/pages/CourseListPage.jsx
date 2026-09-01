import {useEffect, useState} from 'react'
import {useAuth} from '../contexts/AuthContext'
import CourseTable from '../components/tables/CourseTable'
import CourseModal from '../components/modals/CourseModal.jsx'
import {createCourse, getCourses, updateCourse} from '../services/courseService'
import Button from '../components/ui/Button.jsx'
import ErrorBanner from '../components/ui/ErrorBanner.jsx'
import PageSectionHeader from '../components/ui/PageSectionHeader.jsx'
import Icon from '../components/ui/Icon.jsx'

const CourseListPage = () => {
    const {user} = useAuth()
    const [loading, setLoading] = useState(true)
    const [courses, setCourses] = useState([])
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


    return (
        <div className="lg:min-w-[1024px]">
            <ErrorBanner message={error} className="mb-6"/>

            <PageSectionHeader
                title="코스 목록"
                action={
                    <Button onClick={handleOpenCreateModal} className="flex items-center gap-2">
                        <Icon name="plus" size={20}/>
                        <span>코스 개설하기</span>
                    </Button>
                }
            />

            <CourseTable
                courses={courses}
                loading={loading}
                onEditCourse={handleOpenEditModal}
            />

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

export default CourseListPage