import { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import { authAPI } from '../services/authService.js'
import { isTemporaryToken, getUserFromToken } from '../utils/tokenUtils.js'

// 인증 상태
const AuthContext = createContext()

// 초기 상태
const initialState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  needsRegistration: false,
  error: null,
}

// 액션 타입
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  NEEDS_REGISTRATION: 'NEEDS_REGISTRATION',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
}

// 리듀서
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        needsRegistration: false,
        isLoading: false,
        error: null,
      }

    case AUTH_ACTIONS.NEEDS_REGISTRATION:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: false,
        needsRegistration: true,
        isLoading: false,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        needsRegistration: false,
        isLoading: false,
        error: action.payload,
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        needsRegistration: false,
        isLoading: false,
        error: null,
      }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    default:
      return state
  }
}

// AuthProvider 컴포넌트
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // 인증 상태 확인 중복 실행 방지를 위한 ref
  const isCheckingAuthRef = useRef(false)

  // 리트라이 가능한 에러인지 확인하는 함수
  const shouldRetryAuth = (error) => {
    // 네트워크 에러나 일시적 서버 오류인 경우 리트라이
    if (error instanceof TypeError) return true // fetch 네트워크 오류
    if (error.message?.includes('네트워크')) return true
    if (error.message?.includes('Network')) return true
    if (error.code === 'NETWORK_ERROR') return true
    if (error.status >= 500 && error.status < 600) return true // 5xx 서버 에러

    // 인증/권한 관련 에러는 리트라이하지 않음
    if (error.status === 401) return false // Unauthorized
    if (error.status === 403) return false // Forbidden

    // 기타 4xx 에러도 리트라이하지 않음 (잘못된 요청)
    if (error.status >= 400 && error.status < 500) return false

    // 기본적으로 리트라이 허용
    return true
  }

  // 리트라이 로직이 포함된 인증 확인 함수
  const checkAuthWithRetry = async (retryCount = 0, maxRetries = 1) => {
    try {
      // 로컬 스토리지에 토큰이 있으면 검증
      const token = localStorage.getItem('auth_token')
      if (!token) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        return
      }

      // 임시 토큰인 경우 회원가입 필요 상태로 설정
      if (isTemporaryToken(token)) {
        const userFromToken = getUserFromToken(token)
        dispatch({
          type: AUTH_ACTIONS.NEEDS_REGISTRATION,
          payload: userFromToken || { username: '카카오 사용자' },
        })
        return
      }

      // 정식 토큰인 경우 서버에서 토큰 유효성 검증 및 사용자 정보 조회
      const userInfo = await authAPI.validateToken()
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: userInfo,
      })
    } catch (error) {
      // 리트라이 조건 확인
      const shouldRetry = shouldRetryAuth(error) && retryCount < maxRetries

      if (shouldRetry) {
        console.log(`인증 확인 재시도 중... (${retryCount + 1}/${maxRetries + 1})`)
        // 500ms 지연 후 재시도
        await new Promise(resolve => setTimeout(resolve, 500))
        return checkAuthWithRetry(retryCount + 1, maxRetries)
      }

      // 리트라이하지 않을 에러이거나 최대 시도 횟수 초과
      console.error('인증 확인 실패:', error)

      // 토큰이 유효하지 않으면 삭제 (ApiClient에서 이미 삭제했지만 확실히 하기 위해)
      localStorage.removeItem('auth_token')
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: '로그인이 필요합니다.',
      })
    }
  }

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    // 이미 인증 확인 중이면 중복 실행 방지
    if (isCheckingAuthRef.current) {
      return
    }

    const checkAuth = async () => {
      // 인증 확인 시작 플래그 설정
      isCheckingAuthRef.current = true

      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
        await checkAuthWithRetry()
      } finally {
        // 인증 확인 완료 플래그 해제
        isCheckingAuthRef.current = false
      }
    }

    checkAuth()
  }, [])

  // 카카오 로그인
  const loginWithKakao = async (authCode) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })

      const response = await authAPI.loginWithKakao(authCode)

      if (response.requires_registration) {
        dispatch({
          type: AUTH_ACTIONS.NEEDS_REGISTRATION,
          payload: response.user,
        })
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: response.user,
        })
      }

      return response
    } catch (error) {
      console.error('로그인 실패:', error)
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || '로그인에 실패했습니다.',
      })
      throw error
    }
  }

  // 일반 로그인
  const loginWithCredentials = async (username, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })

      const response = await authAPI.loginWithCredentials(username, password)
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: response.user,
      })

      return response
    } catch (error) {
      console.error('로그인 실패:', error)
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || '로그인에 실패했습니다.',
      })
      throw error
    }
  }

  // 일반 회원가입
  const registerUser = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })

      const response = await authAPI.register(userData)
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: response.user,
      })

      // 회원가입 완료 알림
      alert('회원가입이 완료되었습니다! 환영합니다.')

      return response
    } catch (error) {
      console.error('회원가입 실패:', error)

      // 409 Conflict 에러인 경우 홈으로 리다이렉트
      if (error.status === 409 || error.response?.status === 409) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        window.location.href = '/'
        return
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || '회원가입에 실패했습니다.',
      })
      throw error
    }
  }

  // 카카오 회원가입 완료
  const completeKakaoRegistration = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })

      const response = await authAPI.completeKakaoRegistration(userData)
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: response.user,
      })

      // 카카오 회원가입 완료 알림
      alert('카카오 회원가입이 완료되었습니다! 환영합니다.')

      return response
    } catch (error) {
      console.error('회원가입 완료 실패:', error)

      // 409 Conflict 에러인 경우 홈으로 리다이렉트
      if (error.status === 409 || error.response?.status === 409) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        window.location.href = '/'
        return
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || '회원가입 완료에 실패했습니다.',
      })
      throw error
    }
  }

  // 아이디 중복 확인
  const checkUsernameAvailable = async (username) => {
    try {
      return await authAPI.checkUsernameAvailable(username)
    } catch (error) {
      console.error('아이디 중복 확인 실패:', error)
      throw error
    }
  }

  // 로그아웃
  const logout = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
      await authAPI.logout()
    } catch (error) {
      console.error('로그아웃 요청 실패:', error)
      // 서버 요청이 실패해도 로컬에서는 로그아웃 처리
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }

  // 에러 클리어
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  // 사용자 정보 새로고침
  const refreshUser = async () => {
    try {
      const userInfo = await authAPI.getUserInfo()
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: userInfo,
      })
      return userInfo
    } catch (error) {
      console.error('사용자 정보 새로고침 실패:', error)
      throw error
    }
  }

  const value = {
    ...state,
    loginWithKakao,
    loginWithCredentials,
    registerUser,
    completeKakaoRegistration,
    checkUsernameAvailable,
    logout,
    clearError,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// useAuth 훅
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용해야 합니다.')
  }

  return context
}