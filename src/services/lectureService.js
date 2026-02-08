import apiClient from "./apiClient.js";

/**
 * 강의 목록 조회 (전체)
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수
 * @returns {Promise<Array>} 강의 목록
 */
export const getLectures = async (skip = 0, limit = 100) => {
  try {
    return await apiClient.get('/api/lectures', { skip, limit })
  } catch (error) {
    console.error('강의 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 특정 세션의 강의 목록 조회
 * @param {string} sessionId - 세션 ID (UUID)
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수
 * @returns {Promise<Array>} 강의 목록
 */
export const getLecturesBySession = async (sessionId, skip = 0, limit = 100) => {
  try {
    return await apiClient.get(`/api/lectures/session/${sessionId}`, { skip, limit })
  } catch (error) {
    console.error('세션별 강의 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 특정 강의 조회
 * @param {string} lectureId - 강의 ID (UUID)
 * @returns {Promise<Object>} 강의 정보
 */
export const getLecture = async (lectureId) => {
  try {
    return await apiClient.get(`/api/lectures/${lectureId}`)
  } catch (error) {
    console.error('강의 조회 실패:', error)
    throw error
  }
}

/**
 * 새 강의 생성
 * @param {Object} lectureData - 강의 생성 데이터
 * @returns {Promise<Object>} 생성된 강의 정보
 */
export const createLecture = async (lectureData) => {
  try {
    return await apiClient.post('/api/lectures', lectureData)
  } catch (error) {
    console.error('강의 생성 실패:', error)
    throw error
  }
}

/**
 * 강의 정보 수정
 * @param {string} lectureId - 강의 ID (UUID)
 * @param {Object} lectureData - 수정할 강의 데이터
 * @returns {Promise<Object>} 수정된 강의 정보
 */
export const updateLecture = async (lectureId, lectureData) => {
  try {
    return await apiClient.put(`/api/lectures/${lectureId}`, lectureData)
  } catch (error) {
    console.error('강의 수정 실패:', error)
    throw error
  }
}

/**
 * 강의 삭제
 * @param {string} lectureId - 강의 ID (UUID)
 * @returns {Promise<void>}
 */
export const deleteLecture = async (lectureId) => {
  try {
    return await apiClient.delete(`/api/lectures/${lectureId}`)
  } catch (error) {
    console.error('강의 삭제 실패:', error)
    throw error
  }
}

export default {
  getLectures,
  getLecturesBySession,
  getLecture,
  createLecture,
  updateLecture,
  deleteLecture,
}