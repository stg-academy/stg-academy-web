import apiClient from "./apiClient.js";

/**
 * 사용자 정보 목록 조회 (구 API - 검색용으로 사용)
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수 (최대 1000)
 * @returns {Promise<Array>} 사용자 정보 목록
 */
export const getUsersInfo = async (skip = 0, limit = 1000) => {
  try {
    return await apiClient.get('/api/admin/users/info', { skip, limit })
  } catch (error) {
    console.error('사용자 정보 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 사용자 목록 조회 (관리용)
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수 (최대 1000)
 * @returns {Promise<Array>} 사용자 목록
 */
export const getUsers = async (skip = 0, limit = 1000) => {
  try {
    return await apiClient.get('/api/admin/users', { skip, limit })
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 관리자용 사용자 검색 (username/information 부분일치, 서버사이드) — 전체 목록을 불러와
 * 클라이언트에서 필터링하던 기존 방식(EnrollTab/AssistantTab/UserRegistrationModal)을 대체
 * @param {string} query - 검색어
 * @param {number} limit - 최대 결과 수
 * @returns {Promise<Array>} 검색된 사용자 목록
 */
export const searchUsers = async (query, limit = 20) => {
  try {
    return await apiClient.get('/api/admin/users/search', { q: query, limit })
  } catch (error) {
    console.error('사용자 검색 실패:', error)
    throw error
  }
}

/**
 * 사용자 목록 조회 (관리용, 서버사이드 페이지네이션) — X-Total-Count 헤더 기반 총 개수 포함
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수
 * @returns {Promise<{data: Array, totalCount: number}>} 이번 페이지 데이터 + 전체 개수
 */
export const getUsersPaged = async (skip = 0, limit = 30) => {
  try {
    return await apiClient.getPaged('/api/admin/users', { skip, limit })
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 특정 사용자 정보 조회
 * @param {string} userId - 사용자 ID (UUID)
 * @returns {Promise<Object>} 사용자 정보
 */
export const getUser = async (userId) => {
  try {
    return await apiClient.get(`/api/users/${userId}`)
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error)
    throw error
  }
}

/**
 * 사용자 정보 수정 (본인 전용 — user_id가 로그인 사용자와 다르면 403)
 * 허용 필드: username, information, password, phone_number
 * @param {string} userId - 사용자 ID (UUID, 반드시 로그인한 본인)
 * @param {Object} userData - 수정할 사용자 데이터
 * @returns {Promise<Object>} 수정된 사용자 정보
 */
export const updateUser = async (userId, userData) => {
  try {
    return await apiClient.put(`/api/users/${userId}`, userData)
  } catch (error) {
    console.error('사용자 정보 수정 실패:', error)
    throw error
  }
}

/**
 * 사용자 정보 수정 (관리자용 — 소유자 무관, role/is_active 포함 전체 필드)
 * @param {string} userId - 사용자 ID (UUID)
 * @param {Object} userData - 수정할 사용자 데이터
 * @returns {Promise<Object>} 수정된 사용자 정보
 */
export const adminUpdateUser = async (userId, userData) => {
  try {
    return await apiClient.put(`/api/admin/users/${userId}`, userData)
  } catch (error) {
    console.error('사용자 정보 수정 실패(관리자):', error)
    throw error
  }
}

/**
 * 비밀번호 변경 (본인 전용 — 현재 비밀번호 확인 후 변경)
 * kakao/manual 등 비밀번호 없는 계정이거나 현재 비밀번호가 틀리면 401
 * @param {string} currentPassword - 현재 비밀번호
 * @param {string} newPassword - 새 비밀번호
 * @returns {Promise<Object>} 갱신된 사용자 정보
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    return await apiClient.put('/api/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword
    })
  } catch (error) {
    console.error('비밀번호 변경 실패:', error)
    throw error
  }
}

/**
 * 비밀번호 초기화 (관리자 전용 — 대상 계정이 일반(normal) 로그인 계정일 때만 허용)
 * kakao/manual 계정에 시도하면 400
 * @param {string} userId - 대상 사용자 ID (UUID)
 * @returns {Promise<Object>} 임시 비밀번호(temporary_password 등)를 포함한 응답
 */
export const adminResetPassword = async (userId) => {
  try {
    return await apiClient.post(`/api/admin/users/${userId}/reset-password`)
  } catch (error) {
    console.error('비밀번호 초기화 실패:', error)
    throw error
  }
}

/**
 * 개인정보 활용동의 (본인 전용 — 호출 자체가 동의 의사 표시)
 * @returns {Promise<Object>} 갱신된 사용자 정보 (privacy_agreed_at 포함)
 */
export const agreePrivacyConsent = async () => {
  try {
    return await apiClient.post('/api/users/me/privacy-consent')
  } catch (error) {
    console.error('개인정보 활용동의 실패:', error)
    throw error
  }
}

/**
 * 사용자 생성 (추후 구현 예정)
 * @param {Object} userData - 생성할 사용자 데이터
 * @returns {Promise<Object>} 생성된 사용자 정보
 */
export const createUser = async (userData) => {
  // TODO: 사용자 생성 API가 개발되면 구현
  throw new Error('사용자 생성 기능은 아직 구현되지 않았습니다.')
}

/**
 * 정식 가입자 이름 검색 (공개 API, 로그인 페이지 동명이인 식별용)
 * @param {string} username - 검색할 사용자명
 * @returns {Promise<Array>} 검색된 사용자 목록
 */
export const getNormalUsersByUsername = async (username) => {
  try {
    return await apiClient.get('/api/users/normal', { username })
  } catch (error) {
    console.error('사용자 검색 실패:', error)
    throw error
  }
}