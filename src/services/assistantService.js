import apiClient from "./apiClient.js";

/**
 * 세션의 조교 목록 조회
 * @param {string} sessionId - 강좌 ID (UUID)
 * @returns {Promise<Array>} 조교 목록
 */
export const getAssistantsBySession = async (sessionId) => {
  try {
    return await apiClient.get(`/api/admin/sessions/${sessionId}/assistants`)
  } catch (error) {
    console.error('조교 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 세션에 조교 등록
 * @param {string} sessionId - 강좌 ID (UUID)
 * @param {string} userId - 사용자 ID (UUID)
 * @returns {Promise<Object>} 등록된 조교 정보
 */
export const createAssistant = async (sessionId, userId) => {
  try {
    return await apiClient.post(`/api/admin/sessions/${sessionId}/assistants`, { user_id: userId })
  } catch (error) {
    console.error('조교 등록 실패:', error)
    throw error
  }
}

/**
 * 세션에서 조교 해제
 * @param {string} sessionId - 강좌 ID (UUID)
 * @param {string} userId - 사용자 ID (UUID)
 * @returns {Promise<void>}
 */
export const deleteAssistant = async (sessionId, userId) => {
  try {
    return await apiClient.delete(`/api/admin/sessions/${sessionId}/assistants/${userId}`)
  } catch (error) {
    console.error('조교 해제 실패:', error)
    throw error
  }
}
