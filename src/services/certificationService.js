import apiClient from "./apiClient.js";

/**
 * 전체 수료증 목록 조회
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수
 * @returns {Promise<Array>} 수료증 목록
 */
export const getCertifications = async (skip = 0, limit = 1000) => {
  try {
    return await apiClient.get('/api/admin/certifications', { skip, limit })
  } catch (error) {
    console.error('수료증 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 본인 수료증 목록 조회 (셀프서비스)
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수
 * @returns {Promise<Array>} 본인의 수료증 목록
 */
export const getMyCertifications = async (skip = 0, limit = 100) => {
  try {
    return await apiClient.get('/api/certifications/me', { skip, limit })
  } catch (error) {
    console.error('내 수료증 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 본인 수료증 미리보기 이미지 조회 (셀프서비스, 800px)
 * @param {string} certificationId - 수료증 ID (UUID)
 * @returns {Promise<{blob: Blob, filename: string|null}>}
 */
export const getMyCertificationPreview = async (certificationId) => {
  try {
    return await apiClient.getBlob(`/api/certifications/me/${certificationId}/preview`)
  } catch (error) {
    console.error('수료증 미리보기 조회 실패:', error)
    throw error
  }
}

/**
 * 본인 수료증 다운로드용 원본 이미지 조회 (셀프서비스, 2520px)
 * @param {string} certificationId - 수료증 ID (UUID)
 * @returns {Promise<{blob: Blob, filename: string|null}>}
 */
export const getMyCertificationDownload = async (certificationId) => {
  try {
    return await apiClient.getBlob(`/api/certifications/me/${certificationId}/download`)
  } catch (error) {
    console.error('수료증 다운로드 실패:', error)
    throw error
  }
}

/**
 * 수료증 미리보기 이미지 조회 (관리자용, 소유자 무관, 800px)
 * @param {string} certificationId - 수료증 ID (UUID)
 * @returns {Promise<{blob: Blob, filename: string|null}>}
 */
export const getCertificationPreview = async (certificationId) => {
  try {
    return await apiClient.getBlob(`/api/admin/certifications/${certificationId}/preview`)
  } catch (error) {
    console.error('수료증 미리보기 조회 실패:', error)
    throw error
  }
}

/**
 * 수료증 다운로드용 원본 이미지 조회 (관리자용, 소유자 무관, 2520px)
 * @param {string} certificationId - 수료증 ID (UUID)
 * @returns {Promise<{blob: Blob, filename: string|null}>}
 */
export const getCertificationDownload = async (certificationId) => {
  try {
    return await apiClient.getBlob(`/api/admin/certifications/${certificationId}/download`)
  } catch (error) {
    console.error('수료증 다운로드 실패:', error)
    throw error
  }
}

/**
 * 세션 내 개인별 수료증 발급
 * @param {string} sessionId - 강좌 ID (UUID)
 * @param {string} userId - 사용자 ID (UUID)
 * @returns {Promise<Object>} 발급된 수료증 정보
 */
export const createCertification = async (sessionId, userId) => {
  try {
    return await apiClient.post(`/api/admin/sessions/${sessionId}/certifications/${userId}`)
  } catch (error) {
    console.error('수료증 발급 실패:', error)
    throw error
  }
}
