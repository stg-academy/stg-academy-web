import apiClient from "./apiClient.js";

/**
 * 세션의 조교 목록 조회
 * 다른 관리자 목록 API와 동일하게 명시적 skip/limit을 전달 (기존에는 파라미터 없이 호출해
 * 서버 기본 페이지 크기에 암묵적으로 의존하고 있었음). 서버가 이 엔드포인트에서 두 파라미터를
 * 실제로 지원하는지는 별도 확인 필요 — 지원하지 않아도 무시되는 쿼리 파라미터라 안전한 조치.
 * @param {string} sessionId - 강좌 ID (UUID)
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수
 * @returns {Promise<Array>} 조교 목록
 */
export const getAssistantsBySession = async (sessionId, skip = 0, limit = 1000) => {
  try {
    return await apiClient.get(`/api/admin/sessions/${sessionId}/assistants`, { skip, limit })
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
