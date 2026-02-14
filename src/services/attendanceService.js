import apiClient from "./apiClient.js";

/**
 * 특정 강의의 출석 목록 조회
 * @param {string} lectureId - 강의 ID (UUID)
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수
 * @returns {Promise<Array>} 출석 목록
 */
export const getAttendancesByLecture = async (lectureId, skip = 0, limit = 100) => {
  try {
    return await apiClient.get(`/api/attendances/lectures/${lectureId}/attendances`, { skip, limit })
  } catch (error) {
    console.error('강의별 출석 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 특정 강좌의 출석 목록 조회
 * @param {string} lectureId - 강의 ID (UUID)
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수
 * @returns {Promise<Array>} 출석 목록
 */
export const getAttendancesBySession = async (sessionId, skip = 0, limit = 100) => {
  try {
    return await apiClient.get(`/api/attendances/sessions/${sessionId}/attendances`, { skip, limit })
  } catch (error) {
    console.error('강좌별 출석 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 특정 출석 조회
 * @param {string} attendanceId - 출석 ID (UUID)
 * @returns {Promise<Object>} 출석 정보
 */
export const getAttendance = async (attendanceId) => {
  try {
    return await apiClient.get(`/api/attendances/${attendanceId}`)
  } catch (error) {
    console.error('출석 조회 실패:', error)
    throw error
  }
}

/**
 * 새 출석 생성
 * @param {string} lectureId - 강의 ID (UUID)
 * @param {Object} attendanceData - 출석 생성 데이터
 * @returns {Promise<Object>} 생성된 출석 정보
 */
export const createAttendance = async (lectureId, attendanceData) => {
  try {
    return await apiClient.post(`/api/attendances/lectures/${lectureId}/attendances`, attendanceData)
  } catch (error) {
    console.error('출석 생성 실패:', error)
    throw error
  }
}

/**
 * 출석 정보 수정
 * @param {string} attendanceId - 출석 ID (UUID)
 * @param {Object} attendanceData - 수정할 출석 데이터
 * @returns {Promise<Object>} 수정된 출석 정보
 */
export const updateAttendance = async (attendanceId, attendanceData) => {
  try {
    return await apiClient.put(`/api/attendances/${attendanceId}`, attendanceData)
  } catch (error) {
    console.error('출석 수정 실패:', error)
    throw error
  }
}

export default {
  getAttendancesByLecture,
  getAttendance,
  createAttendance,
  updateAttendance,
}