// API 통신 유틸리티
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  // HTTP 요청 공통 처리
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`

    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    // 인증 토큰이 있으면 헤더에 추가
    const token = this.getAuthToken()
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      // 401 Unauthorized - 토큰 만료 또는 인증 실패
      if (response.status === 401) {
        this.clearAuthToken()
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.')
      }

      // 응답이 JSON이 아닐 수 있으므로 먼저 확인
      const contentType = response.headers.get('content-type')
      let data

      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        const errorMessage = data.message || data.error || `HTTP ${response.status}`
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('네트워크 연결을 확인해주세요.')
      }
      throw error
    }
  }

  // GET 요청
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint

    return this.request(url, {
      method: 'GET',
    })
  }

  // POST 요청
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // 인증 토큰 관리
  setAuthToken(token) {
    localStorage.setItem('auth_token', token)
  }

  getAuthToken() {
    return localStorage.getItem('auth_token')
  }

  clearAuthToken() {
    localStorage.removeItem('auth_token')
  }

  // 인증 상태 확인
  isAuthenticated() {
    return !!this.getAuthToken()
  }
}

// 싱글톤 인스턴스
const apiClient = new ApiClient()

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

// 기본 API 클라이언트 내보내기
export default apiClient