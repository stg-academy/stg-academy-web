import {useState, useEffect} from 'react'
import Modal from '../ui/Modal.jsx'
import TextInput from '../forms/TextInput.jsx'
import TextareaInput from '../forms/TextareaInput.jsx'

const CourseModal = ({isOpen, onClose, onSubmit, editingCourse = null}) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        keyword: '',
    })
    const [errors, setErrors] = useState({})


    // 수정 모드일 때 기존 데이터 로드
    useEffect(() => {
        if (editingCourse) {
            setFormData({
                title: editingCourse.title || '',
                description: editingCourse.description || '',
                keyword: editingCourse.keyword || '',
            })
        } else {
            setFormData({
                title: '',
                description: '',
                keyword: '',
            })
        }
        setErrors({})
    }, [editingCourse, isOpen])

    // 폼 입력 처리
    const handleChange = (e) => {
        const {name, value} = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // 입력 시 해당 필드의 에러 제거
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    // 유효성 검사
    const validate = () => {
        const newErrors = {}

        if (!formData.title.trim()) {
            newErrors.title = '코스명을 입력해주세요'
        }

        if (!formData.description.trim()) {
            newErrors.description = '코스 소개를 입력해주세요'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // 폼 제출 - Modal에서 호출됨
    const handleSubmit = async () => {
        if (!validate()) {
            throw new Error('입력값을 확인해주세요')
        }

        try {
            await onSubmit(formData)
        } catch (error) {
            console.error('코스 저장 실패:', error)
            setErrors({
                submit: error.message || '코스 저장에 실패했습니다'
            })
            throw error // Modal로 에러 전파
        }
    }

    // 모달 닫기
    const handleClose = () => {
        setFormData({
            title: '',
            description: '',
            keyword: '',
        })
        setErrors({})
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={editingCourse ? '코스 수정하기' : '코스 개설하기'}
            onSubmit={handleSubmit}
            submitText="저장하기"
            loadingText="저장 중..."
        >
            <div className="space-y-6">
                <TextInput
                    id="title"
                    name="title"
                    label="코스명"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="강좌명을 입력해주세요"
                    required={true}
                    error={errors.title}
                />

                <TextareaInput
                    id="description"
                    name="description"
                    label="코스 소개"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="강좌에 대한 소개를 입력해주세요"
                    required={true}
                    error={errors.description}
                    rows={6}
                />

                <TextInput
                    id="keyword"
                    name="keyword"
                    label="검색 키워드"
                    value={formData.keyword}
                    onChange={handleChange}
                    placeholder="검색에 사용할 키워드를 입력해주세요"
                    required={false}
                    error={errors.keyword}
                    description="* 입력하지 않으면 코스명으로 검색됩니다"
                />

                {/* 에러 메시지 */}
                {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-600">{errors.submit}</p>
                    </div>
                )}
            </div>
        </Modal>
    )
}

export default CourseModal