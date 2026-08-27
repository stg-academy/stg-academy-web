import apiClient from "./apiClient.js";

/**
 * 전체 수강 신청 목록 조회
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수
 * @returns {Promise<Array>} 수강 신청 목록
 */
export const getEnrolls = async (skip = 0, limit = 1000) => {
  try {
    return await apiClient.get('/api/admin/enrolls/', { skip, limit })
  } catch (error) {
    console.error('수강 신청 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 특정 사용자의 수강 신청 목록 조회
 * @param {string} userId - 사용자 ID (UUID)
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수
 * @returns {Promise<Array>} 사용자의 수강 신청 목록
 */
export const getEnrollsByUser = async (userId, skip = 0, limit = 1000) => {
  try {
    return await apiClient.get(`/api/admin/enrolls/users/${userId}/enrolls`, { skip, limit })
  } catch (error) {
    console.error('사용자별 수강 신청 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 특정 강좌의 수강 신청 목록 조회 — 빈 페이지가 나올 때까지 반복 호출해 전체를 받아옴
 * (EnrollTab 중복신청 체크, AttendanceTab 일괄 결석처리 대상 계산이 전체 목록을 전제로 하므로 누락되면 안 됨)
 * @param {string} sessionId - 강좌 ID (UUID)
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수
 * @returns {Promise<Array>} 강좌의 수강 신청 목록
 */
export const getEnrollsBySession = async (sessionId, skip = 0, limit = 10000) => {
  try {
    const pageSize = Math.min(limit, 1000)
    const allData = []
    let currentSkip = skip
    while (true) {
      const page = await apiClient.get(`/api/admin/enrolls/sessions/${sessionId}/enrolls`, { skip: currentSkip, limit: pageSize })
      if (!Array.isArray(page) || page.length === 0) break
      allData.push(...page)
      if (page.length < pageSize) break
      currentSkip += pageSize
    }
    return allData
  } catch (error) {
    console.error('강좌별 수강 신청 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 특정 사용자의 특정 강좌 수강 신청 정보 조회
 * @param {string} userId - 사용자 ID (UUID)
 * @param {string} sessionId - 강좌 ID (UUID)
 * @returns {Promise<Object>} 수강 신청 정보
 */
export const getUserEnrollmentInSession = async (userId, sessionId) => {
  try {
    return await apiClient.get(`/api/admin/enrolls/users/${userId}/sessions/${sessionId}`)
  } catch (error) {
    console.error('사용자 강좌 수강 신청 조회 실패:', error)
    throw error
  }
}

/**
 * 본인 수강 신청 목록 조회 (셀프서비스)
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수
 * @returns {Promise<Array>} 본인의 수강 신청 목록
 */
export const getMyEnrolls = async (skip = 0, limit = 1000) => {
  try {
    return await apiClient.get('/api/enrolls/me', { skip, limit })
  } catch (error) {
    console.error('내 수강 신청 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 본인의 특정 강좌 수강 신청 정보 조회 (셀프서비스)
 * @param {string} sessionId - 강좌 ID (UUID)
 * @returns {Promise<Object>} 수강 신청 정보
 */
export const getMySessionEnrollment = async (sessionId) => {
  try {
    return await apiClient.get(`/api/enrolls/me/sessions/${sessionId}`)
  } catch (error) {
    console.error('내 강좌 수강 신청 조회 실패:', error)
    throw error
  }
}

/**
 * 새로운 수강 신청 생성 (관리자 — 타인을 대신 등록)
 * @param {Object} enrollData - 수강 신청 데이터
 * @param {string} enrollData.user_id - 사용자 ID
 * @param {string} enrollData.session_id - 강좌 ID
 * @param {string} enrollData.enroll_status - 수강 상태
 * @returns {Promise<Object>} 생성된 수강 신청 정보
 */
export const createEnroll = async (enrollData) => {
  try {
    return await apiClient.post('/api/admin/enrolls', enrollData)
  } catch (error) {
    console.error('수강 신청 생성 실패:', error)
    throw error
  }
}

/**
 * 본인 명의 수강 신청 생성 (셀프서비스)
 * @param {Object} enrollData - 수강 신청 데이터
 * @param {string} enrollData.user_id - 사용자 ID (로그인한 본인이어야 함)
 * @param {string} enrollData.session_id - 강좌 ID
 * @param {string} [enrollData.enroll_status] - 수강 상태
 * @returns {Promise<Object>} 생성된 수강 신청 정보
 */
export const createSelfEnroll = async (enrollData) => {
  try {
    return await apiClient.post('/api/enrolls/me', enrollData)
  } catch (error) {
    console.error('셀프 수강 신청 생성 실패:', error)
    throw error
  }
}

/**
 * 수강 신청 정보 수정
 * @param {string} enrollId - 수강 신청 ID (UUID)
 * @param {Object} enrollData - 수정할 수강 신청 데이터
 * @param {string} enrollData.enroll_status - 수강 상태
 * @returns {Promise<Object>} 수정된 수강 신청 정보
 */
export const updateEnroll = async (enrollId, enrollData) => {
  try {
    return await apiClient.put(`/api/admin/enrolls/${enrollId}`, enrollData)
  } catch (error) {
    console.error('수강 신청 수정 실패:', error)
    throw error
  }
}