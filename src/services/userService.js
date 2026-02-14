import apiClient from "./apiClient.js";

/**
 * 사용자 정보 목록 조회
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수 (최대 1000)
 * @returns {Promise<Array>} 사용자 정보 목록
 */
export const getUsersInfo = async (skip = 0, limit = 100) => {
  try {
    return await apiClient.get('/api/users/info', { skip, limit })
  } catch (error) {
    console.error('사용자 정보 목록 조회 실패:', error)
    throw error
  }
}