import { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../utils/api'

// 인증 상태
const AuthContext = createContext()

// 초기 상태
const initialState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
}

// 액션 타입
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
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
        isLoading: false,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
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

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })

        // 로컬 스토리지에 토큰이 있으면 검증
        const token = localStorage.getItem('auth_token')
        if (!token) {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
          return
        }

        // 서버에서 토큰 유효성 검증 및 사용자 정보 조회
        const userInfo = await authAPI.validateToken()
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: userInfo,
        })
      } catch (error) {
        console.error('인증 확인 실패:', error)
        // 토큰이 유효하지 않으면 삭제
        localStorage.removeItem('auth_token')
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: '로그인이 필요합니다.',
        })
      }
    }

    checkAuth()
  }, [])

  // 카카오 로그인
  const loginWithKakao = async (authCode) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })

      const response = await authAPI.loginWithKakao(authCode)
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