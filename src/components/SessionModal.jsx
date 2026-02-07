import { useState, useEffect } from 'react'
import Modal from './ui/Modal'
import TextInput from './forms/TextInput'
import TextareaInput from './forms/TextareaInput'
import SelectInput from './forms/SelectInput'
import DateInput from './forms/DateInput'
import NumberInput from './forms/NumberInput'

const SessionModal = ({ isOpen, onClose, onSubmit, editingSession = null, courses = [], preselectedCourseId = null }) => {
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    lecturer_info: '',
    date_info: '',
    begin_date: '',
    end_date: '',
  })
  const [errors, setErrors] = useState({})

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (editingSession) {
      setFormData({
        course_id: editingSession.course_id || '',
        title: editingSession.title || '',
        description: editingSession.description || '',
        lecturer_info: editingSession.lecturer_info || '',
        date_info: editingSession.date_info || '',
        begin_date: editingSession.begin_date || '',
        end_date: editingSession.end_date || '',
      })
    } else {
      setFormData({
        course_id: preselectedCourseId || '',
        title: '',
        description: '',
        lecturer_info: '',
        date_info: '',
        begin_date: '',
        end_date: '',
      })
    }
    setErrors({})
  }, [editingSession, isOpen, preselectedCourseId])

  // 폼 입력 처리
  const handleChange = (e) => {
    const { name, value } = e.target
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

    if (!formData.course_id) {
      newErrors.course_id = '코스를 선택해주세요'
    }

    if (!formData.title.trim()) {
      newErrors.title = '세션명을 입력해주세요'
    }

    if (!formData.lecturer_info.trim()) {
      newErrors.lecturer_info = '주강사를 입력해주세요'
    }

    if (!formData.begin_date) {
        newErrors.begin_date = '시작 날짜를 선택해주세요'
    }
    if (!formData.end_date) {
        newErrors.end_date = '종료 날짜를 선택해주세요'
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
      // 성공 시 폼 초기화
      setFormData({
        course_id: '',
        title: '',
        description: '',
        lecturer_info: '',
        date_info: '',
        begin_date: '',
        end_date: '',
      })
      setErrors({})
    } catch (error) {
      console.error('세션 저장 실패:', error)
      setErrors({
        submit: error.message || '세션 저장에 실패했습니다'
      })
      throw error // Modal로 에러 전파
    }
  }

  // 모달 닫기
  const handleClose = () => {
    setFormData({
      course_id: '',
      title: '',
      description: '',
      lecturer_info: '',
      date_info: '',
      begin_date: '',
      end_date: '',
    })
    setErrors({})
    onClose()
  }

  // 코스 옵션 변환
  const courseOptions = courses.map(course => ({
    value: course.id,
    label: course.name || course.title
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingSession ? '세션 수정하기' : '세션 생성하기'}
      onSubmit={handleSubmit}
      submitText="저장하기"
      loadingText="저장 중..."
      width="md:w-[600px]"
    >
      <div className="space-y-6">
        <SelectInput
          id="course_id"
          name="course_id"
          label="코스 선택"
          value={formData.course_id}
          onChange={handleChange}
          options={courseOptions}
          placeholder="코스를 선택해주세요"
          required={true}
          error={errors.course_id}
          description="* 등록한 세션은 코스 내 세션 목록에서 조회됩니다"
        />

        <TextInput
          id="title"
          name="title"
          label="세션명"
          value={formData.title}
          onChange={handleChange}
          placeholder="세션명을 입력해주세요"
          required={true}
          error={errors.title}
        />

        <TextInput
          id="lecturer_info"
          name="lecturer_info"
          label="주강사"
          value={formData.lecturer_info}
          onChange={handleChange}
          placeholder="주강사명을 입력해주세요"
          required={true}
          error={errors.lecturer_info}
        />

        <TextInput
          id="date_info"
          name="date_info"
          label="강의 일시"
          value={formData.date_info}
          onChange={handleChange}
          placeholder="강의 일시를 입력해주세요 (예: 매주 화요일 19:00)"
          required={false}
        />

        <div className="grid grid-cols-2 gap-4">
          <DateInput
            id="begin_date"
            name="begin_date"
            label="시작 날짜"
            value={formData.begin_date}
            onChange={handleChange}
            required={true}
            error={errors.begin_date}
          />

          <DateInput
            id="end_date"
            name="end_date"
            label="종료 날짜"
            value={formData.end_date}
            onChange={handleChange}
            required={true}
            error={errors.end_date}
          />
        </div>

        <TextareaInput
          id="description"
          name="description"
          label="세션 소개"
          value={formData.description}
          onChange={handleChange}
          placeholder="세션에 대한 소개를 입력해주세요"
          required={false}
          rows={6}
          description="* 세션에 대한 상세한 설명을 입력하세요"
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

export default SessionModal