import apiClient from "./apiClient.js";

// 인증 관련 API (서버 스펙에 맞게 수정)
export const authAPI = {
    // 카카오 로그인 (POST /auth/kakao/login)
    async loginWithKakao(authCode) {
        const response = await apiClient.post('/auth/kakao/login', {
            code: authCode,
        })

        // 백엔드에서 JWT 토큰 반환 시 저장
        if (response.token) {
            apiClient.setAuthToken(response.token)
        }

        return response
    },

    // 로그아웃 (POST /auth/logout)
    async logout() {
        try {
            await apiClient.post('/auth/logout')
        } finally {
            // 서버 요청 성공 여부와 관계없이 로컬 토큰 삭제
            apiClient.clearAuthToken()
        }
    },

    // 사용자 정보 조회 (GET /auth/me)
    async getUserInfo() {
        return apiClient.get('/auth/me')
    },

    // 토큰 유효성 검증 (GET /auth/me를 사용)
    async validateToken() {
        try {
            return await apiClient.get('/auth/me')
        } catch (error) {
            apiClient.clearAuthToken()
            throw error
        }
    },
}
