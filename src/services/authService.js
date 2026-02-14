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

    // 일반 로그인 (POST /auth/login)
    async loginWithCredentials(username, password) {
        const response = await apiClient.post('/auth/login', {
            username,
            password
        })

        // JWT 토큰 저장
        if (response.token) {
            apiClient.setAuthToken(response.token)
        }

        return response
    },

    // 일반 회원가입 (POST /auth/register)
    async register(userData) {
        const response = await apiClient.post('/auth/register', {
            username: userData.username,
            password: userData.password,
            display_name: userData.display_name,
            information: userData.information
        })

        // JWT 토큰 저장
        if (response.token) {
            apiClient.setAuthToken(response.token)
        }

        return response
    },

    // 카카오 회원가입 완료 (POST /auth/kakao/register)
    async completeKakaoRegistration(userData) {
        const response = await apiClient.post('/auth/kakao/register', {
            username: userData.username,
            information: userData.information
        })

        // 정식 JWT 토큰으로 교체
        if (response.token) {
            apiClient.setAuthToken(response.token)
        }

        return response
    },

    // 아이디 중복 확인 (GET /auth/username?username=user_id)
    async checkUsernameAvailable(username) {
        return await apiClient.get('/auth/username', { username })
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
