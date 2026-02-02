import apiClient from "./apiClient.js";

/**
 * 코스 목록 조회
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수
 * @returns {Promise<Array>} 코스 목록
 */
export const getCourses = async (skip = 0, limit = 100) => {
  try {
    return await apiClient.get('/api/courses', { skip, limit })
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
    return await apiClient.get(`/api/courses/${courseId}`)
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
    return await apiClient.post('/api/courses', courseData)
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
    return await apiClient.put(`/api/courses/${courseId}`, courseData)
  } catch (error) {
    console.error('코스 수정 실패:', error)
    throw error
  }
}

/**
 * 코스 삭제
 * @param {string} courseId - 코스 ID (UUID)
 * @returns {Promise<void>}
 */
export const deleteCourse = async (courseId) => {
  try {
    return await apiClient.delete(`/api/courses/${courseId}`)
  } catch (error) {
    console.error('코스 삭제 실패:', error)
    throw error
  }
}

export default {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
}

