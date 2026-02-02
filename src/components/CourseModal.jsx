import { useState, useEffect } from 'react'

const CourseModal = ({ isOpen, onClose, onSubmit, editingCourse = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    search_keywords: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (editingCourse) {
      setFormData({
        name: editingCourse.name || '',
        description: editingCourse.description || '',
        search_keywords: editingCourse.search_keywords || '',
      })
    } else {
      setFormData({
        name: '',
        description: '',
        search_keywords: '',
      })
    }
    setErrors({})
  }, [editingCourse, isOpen])

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

    if (!formData.name.trim()) {
      newErrors.name = '코스명을 입력해주세요'
    }

    if (!formData.description.trim()) {
      newErrors.description = '코스 소개를 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      // 성공 시 폼 초기화 및 모달 닫기
      setFormData({
        name: '',
        description: '',
        search_keywords: '',
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('코스 저장 실패:', error)
      setErrors({
        submit: error.message || '코스 저장에 실패했습니다'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 모달 닫기
  const handleClose = () => {
    if (isSubmitting) return
    setFormData({
      name: '',
      description: '',
      search_keywords: '',
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* 오버레이 */}
      <div 
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* 모달 */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white shadow-xl z-50 transform transition-transform">
        <div className="h-full flex flex-col">
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCourse ? '코스 수정하기' : '코스 개설하기'}
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 바디 */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 코스명 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  코스명
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="강좌명을 입력해주세요"
                  className={`w-full px-4 py-3 border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* 코스 소개 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  코스 소개
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="강좌에 대한 소개를 입력해주세요"
                  rows={6}
                  className={`w-full px-4 py-3 border ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
                  disabled={isSubmitting}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              {/* 검색 키워드 */}
              <div>
                <label htmlFor="search_keywords" className="block text-sm font-medium text-gray-700 mb-2">
                  검색 키워드
                </label>
                <input
                  type="text"
                  id="search_keywords"
                  name="search_keywords"
                  value={formData.search_keywords}
                  onChange={handleChange}
                  placeholder="검색에 사용할 키워드를 입력해주세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-xs text-gray-500">
                  * 입력하지 않으면 코스명으로 검색됩니다
                </p>
              </div>

              {/* 에러 메시지 */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}
            </form>
          </div>

          {/* 푸터 */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gray-900 hover:bg-gray-800'
              }`}
            >
              {isSubmitting ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default CourseModal
