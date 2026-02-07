import apiClient from "./apiClient.js";

/**
 * 세션 목록 조회
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수
 * @returns {Promise<Array>} 세션 목록
 */
export const getSessions = async (skip = 0, limit = 100) => {
  try {
    return await apiClient.get('/api/sessions', { skip, limit })
  } catch (error) {
    console.error('세션 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 특정 세션 조회
 * @param {string} sessionId - 세션 ID (UUID)
 * @returns {Promise<Object>} 세션 정보
 */
export const getSession = async (sessionId) => {
  try {
    return await apiClient.get(`/api/sessions/${sessionId}`)
  } catch (error) {
    console.error('세션 조회 실패:', error)
    throw error
  }
}

/**
 * 새 세션 생성
 * @param {Object} sessionData - 세션 생성 데이터
 * @returns {Promise<Object>} 생성된 세션 정보
 */
export const createSession = async (sessionData) => {
  try {
    return await apiClient.post('/api/sessions', sessionData)
  } catch (error) {
    console.error('세션 생성 실패:', error)
    throw error
  }
}

/**
 * 세션 정보 수정
 * @param {string} sessionId - 세션 ID (UUID)
 * @param {Object} sessionData - 수정할 세션 데이터
 * @returns {Promise<Object>} 수정된 세션 정보
 */
export const updateSession = async (sessionId, sessionData) => {
  try {
    return await apiClient.put(`/api/sessions/${sessionId}`, sessionData)
  } catch (error) {
    console.error('세션 수정 실패:', error)
    throw error
  }
}

/**
 * 세션 삭제
 * @param {string} sessionId - 세션 ID (UUID)
 * @returns {Promise<void>}
 */
export const deleteSession = async (sessionId) => {
  try {
    return await apiClient.delete(`/api/sessions/${sessionId}`)
  } catch (error) {
    console.error('세션 삭제 실패:', error)
    throw error
  }
}

export default {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
}