// 카카오 OAuth 직접 연동 설정
export const KAKAO_CONFIG = {
  clientId: import.meta.env.VITE_KAKAO_CLIENT_ID,
  redirectUri: import.meta.env.VITE_KAKAO_REDIRECT_URI,
  authUrl: 'https://kauth.kakao.com/oauth/authorize',
  scope: 'profile_nickname',
}

// 카카오 로그인 URL 생성
export const getKakaoLoginUrl = () => {
  if (!KAKAO_CONFIG.clientId || !KAKAO_CONFIG.redirectUri) {
    throw new Error('카카오 설정이 누락되었습니다. 환경변수를 확인해주세요.')
  }

  const params = new URLSearchParams({
    client_id: KAKAO_CONFIG.clientId,
    redirect_uri: KAKAO_CONFIG.redirectUri,
    response_type: 'code',
    scope: KAKAO_CONFIG.scope,
  })

  return `${KAKAO_CONFIG.authUrl}?${params.toString()}`
}

// 카카오 로그인 시작
export const startKakaoLogin = () => {
  const loginUrl = getKakaoLoginUrl()
  window.location.href = loginUrl
}

// URL에서 authorization code 추출
export const getAuthCodeFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const error = urlParams.get('error')
  const errorDescription = urlParams.get('error_description')

  if (error) {
    throw new Error(`카카오 로그인 오류: ${error} - ${errorDescription}`)
  }

  if (!code) {
    throw new Error('인증 코드를 찾을 수 없습니다.')
  }

  return code
}

// URL 파라미터 정리
export const clearUrlParams = () => {
  const url = new URL(window.location.href)
  url.search = ''
  window.history.replaceState({}, document.title, url.toString())
}