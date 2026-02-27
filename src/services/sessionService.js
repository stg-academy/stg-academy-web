import apiClient from "./apiClient.js";

/**
 * 강좌 목록 조회
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수
 * @returns {Promise<Array>} 강좌 목록
 */
export const getSessions = async (skip = 0, limit = 100) => {
  try {
    return await apiClient.get('/api/sessions', { skip, limit })
  } catch (error) {
    console.error('강좌 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 특정 강좌 조회
 * @param {string} sessionId - 강좌 ID (UUID)
 * @returns {Promise<Object>} 강좌 정보
 */
export const getSession = async (sessionId) => {
  try {
    return await apiClient.get(`/api/sessions/${sessionId}`)
  } catch (error) {
    console.error('강좌 조회 실패:', error)
    throw error
  }
}

/**
 * 새 강좌 생성
 * @param {Object} sessionData - 강좌 생성 데이터
 * @returns {Promise<Object>} 생성된 강좌 정보
 */
export const createSession = async (sessionData) => {
  try {
    return await apiClient.post('/api/sessions', sessionData)
  } catch (error) {
    console.error('강좌 생성 실패:', error)
    throw error
  }
}

/**
 * 강좌 정보 수정
 * @param {string} sessionId - 강좌 ID (UUID)
 * @param {Object} sessionData - 수정할 강좌 데이터
 * @returns {Promise<Object>} 수정된 강좌 정보
 */
export const updateSession = async (sessionId, sessionData) => {
  try {
    return await apiClient.put(`/api/sessions/${sessionId}`, sessionData)
  } catch (error) {
    console.error('강좌 수정 실패:', error)
    throw error
  }
}

/**
 * 강좌 삭제
 * @param {string} sessionId - 강좌 ID (UUID)
 * @returns {Promise<void>}
 */
export const deleteSession = async (sessionId) => {
  try {
    return await apiClient.delete(`/api/sessions/${sessionId}`)
  } catch (error) {
    console.error('강좌 삭제 실패:', error)
    throw error
  }
}

/**
 * 강좌 출석 인증코드 새로고침
 * @param {string} sessionId - 강좌 ID (UUID)
 * @returns {Promise<Object>} 수정된 강좌 정보
 */
export const updateSessionCode = async (sessionId) => {
  try {
    return await apiClient.put(`/api/sessions/${sessionId}/code`)
  } catch (error) {
    console.error('출석 인증코드 새로고침 실패:', error)
    throw error
  }
}

export default {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  updateSessionCode,
}