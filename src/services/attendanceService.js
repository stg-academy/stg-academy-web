import apiClient from "./apiClient.js";
import {ATTENDANCE_CONFIG} from "../utils/attendanceStatus.js";

/**
 * 특정 강의의 출석 목록 조회
 * @param {string} lectureId - 강의 ID (UUID)
 * @param {number} skip - 건너뛸 항목 수
 * @param {number} limit - 조회할 항목 수
 * @returns {Promise<Array>} 출석 목록
 */
export const getAttendancesByLecture = async (lectureId, skip = 0, limit = 10000) => {
    try {
        const pageSize = Math.min(limit, 1000) // API의 최대 페이지 크기에 맞춰 조정;
        const allData = []
        let currentSkip = skip
        while (true) {
            const page = await apiClient.get(`/api/attendances/lectures/${lectureId}/attendances`, {skip: currentSkip, limit: pageSize})
            if (!Array.isArray(page) || page.length === 0) break
            allData.push(...page)
            if (page.length < pageSize) break
            currentSkip += pageSize
        }
        return allData
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
export const getAttendancesBySession = async (sessionId, skip = 0, limit = 10000) => {
    try {
        const pageSize = Math.min(limit, 1000) // API의 최대 페이지 크기에 맞춰 조정;
        const allData = []
        let currentSkip = skip
        while (true) {
            const page = await apiClient.get(`/api/attendances/sessions/${sessionId}/attendances`, {skip: currentSkip, limit: pageSize})
            if (!Array.isArray(page) || page.length === 0) break
            allData.push(...page)
            if (page.length < pageSize) break
            currentSkip += pageSize
        }
        return allData
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

/**
 * 출석 생성 또는 수정 (존재하지 않으면 생성, 존재하면 수정)
 * @param {string} lectureId - 강의 ID (UUID)
 * @param {string} userId - 사용자 ID (UUID)
 * @param {string} attendanceType - 출석 타입 (ATTENDANCE_CONFIG의 키)
 * @param {string} note - 비고 (선택사항)
 * @returns {Promise<Object>} 생성 또는 수정된 출석 정보
 */
export const createOrUpdateAttendance = async (lectureId, userId, attendanceType, note = '') => {
    try {
        const config = ATTENDANCE_CONFIG[attendanceType]

        if (!config) {
            throw new Error(`유효하지 않은 출석 타입: ${attendanceType}`);
        }

        // 출석 데이터 구성
        const attendanceData = {
            user_id: userId,
            status: config.status || attendanceType,
            detail_type: config.detail_type || attendanceType,
            note: note || ''
        }

        const existingAttendances = await getAttendancesByLecture(lectureId)
        const existingAttendance = existingAttendances.find(
            att => (att.user_id === userId || att.student_id === userId)
        )

        if (existingAttendance) {
            // 기존 출석이 있으면 수정
            return await updateAttendance(existingAttendance.id, attendanceData)
        } else {
            // 기존 출석이 없으면 새로 생성
            return await createAttendance(lectureId, attendanceData)
        }

    } catch (error) {
        console.error('출석 생성/수정 실패:', error)
        throw error
    }
}

/**
 * 출석 인증코드를 이용한 출석 생성
 * @param {string} lectureId - 강의 ID (UUID)
 * @param {Object} attendanceData - 출석 데이터
 * @param {string} attendanceData.status - 출석 상태
 * @param {string} attendanceData.detail_type - 세부 타입 (선택사항)
 * @param {string} attendanceData.description - 설명 (선택사항)
 * @param {string} attendanceData.assignment_id - 과제 ID (선택사항)
 * @param {string} attendanceData.user_id - 사용자 ID (UUID)
 * @param {string} attendanceData.attendance_code - 출석 인증코드
 * @returns {Promise<Object>} 생성된 출석 정보
 */
export const createAttendanceWithCode = async (lectureId, attendanceData) => {
    try {
        return await apiClient.post(`/api/attendances/lectures/${lectureId}/attendances/code`, attendanceData)
    } catch (error) {
        console.error('출석 인증코드 생성 실패:', error)

        // 에러 메시지 매핑
        const errorMessage = error.response?.data?.detail || error.message

        if (errorMessage.includes('Lecture not found')) {
            throw new Error('강의를 찾을 수 없습니다.')
        } else if (errorMessage.includes('Session not found')) {
            throw new Error('강좌를 찾을 수 없습니다.')
        } else if (errorMessage.includes('Invalid attendance code')) {
            throw new Error('출석 인증코드가 올바르지 않습니다.')
        }

        throw error
    }
}

/**
 * 현재 로그인 사용자의 세션 출석 목록 조회
 * @param {string} sessionId - 강좌 ID (UUID)
 * @returns {Promise<Array>} 나의 출석 목록
 */
export const getMyAttendancesBySession = async (sessionId) => {
    try {
        return await apiClient.get(`/api/attendances/sessions/${sessionId}/my-attendances`)
    } catch (error) {
        console.error('나의 세션 출석 목록 조회 실패:', error)
        throw error
    }
}

/**
 * 현재 로그인 사용자의 강의 단건 출석 조회
 * @param {string} lectureId - 강의 ID (UUID)
 * @returns {Promise<Object|null>} 나의 출석 정보 (없으면 null)
 */
export const getMyAttendanceByLecture = async (lectureId) => {
    try {
        return await apiClient.get(`/api/attendances/lectures/${lectureId}/my-attendance`)
    } catch (error) {
        // 출석 기록 없음 (404 등)은 null 반환
        if (error.message?.includes('404') || error.message?.includes('not found') || error.message?.includes('Not found')) {
            return null
        }
        console.error('나의 강의 출석 조회 실패:', error)
        throw error
    }
}

export default {
    getAttendancesByLecture,
    getAttendancesBySession,
    getAttendance,
    createAttendance,
    updateAttendance,
    createOrUpdateAttendance,
    createAttendanceWithCode,
    getMyAttendancesBySession,
    getMyAttendanceByLecture,
}