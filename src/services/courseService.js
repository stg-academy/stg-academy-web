// 코스 관리 API 서비스
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * 인증 토큰 가져오기
 */
const getAuthToken = () => {
  const token = sessionStorage.getItem('authToken')
  return token
}

/**
 * API 요청 헤더 생성
 */
const getHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  }
  
  if (includeAuth) {
    const token = getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  
  return headers
}

/**
 * 코스 목록 조회
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수
 * @returns {Promise<Array>} 코스 목록
 */
export const getCourses = async (skip = 0, limit = 100) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/courses?skip=${skip}&limit=${limit}`,
      {
        method: 'GET',
        headers: getHeaders(false),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('코스 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 특정 코스 조회
 * @param {string} courseId - 코스 ID (UUID)
 * @returns {Promise<Object>} 코스 정보
 */
export const getCourse = async (courseId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/courses/${courseId}`,
      {
        method: 'GET',
        headers: getHeaders(false),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('코스 조회 실패:', error)
    throw error
  }
}

/**
 * 새 코스 생성
 * @param {Object} courseData - 코스 생성 데이터
 * @param {string} courseData.name - 코스명
 * @param {string} courseData.description - 코스 소개
 * @param {string} courseData.search_keywords - 검색 키워드
 * @returns {Promise<Object>} 생성된 코스 정보
 */
export const createCourse = async (courseData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/courses`,
      {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(courseData),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('코스 생성 실패:', error)
    throw error
  }
}

/**
 * 코스 정보 수정
 * @param {string} courseId - 코스 ID (UUID)
 * @param {Object} courseData - 수정할 코스 데이터
 * @returns {Promise<Object>} 수정된 코스 정보
 */
export const updateCourse = async (courseId, courseData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/courses/${courseId}`,
      {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(courseData),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('코스 수정 실패:', error)
    throw error
  }
}

export default {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
}
