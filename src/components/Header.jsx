import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { startKakaoLogin } from '../config/kakao'
import { isAdmin } from '../utils/roleUtils'

import User from '../assets/icons/user.svg?react';


const Header = () => {
  const { user, isAuthenticated, needsRegistration, isLoading, logout } = useAuth()
  const [notificationCount] = useState(3)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const mobileMenuRef = useRef(null)
  const mobileMenuButtonRef = useRef(null)

  // 네비게이션 메뉴 (역할 기반 필터링)
  const getAllNavigationItems = () => [
    { name: '샘플 대시보드', href: '/', icon: 'dashboard', adminOnly: false },
    { name: '샘플 페이지', href: '/sample', icon: 'page', adminOnly: false },
    { name: '디자인 가이드', href: '/design-guide', icon: 'design', adminOnly: false },
    { name: '코스 관리', href: '/courses', icon: 'dashboard', adminOnly: true },
    { name: '사용자 관리', href: '/users', icon: 'users', adminOnly: true }
  ]

  const navigationItems = getAllNavigationItems().filter(item => {
    if (!item.adminOnly) return true // 모든 사용자에게 허용
    return isAdmin(user) // 관리자만 허용
  })

  // 현재 페이지 확인
  const isCurrentPage = (href) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  // 아이콘 렌더링
  const renderIcon = (iconType) => {
    switch (iconType) {
      case 'dashboard':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10z" />
          </svg>
        )
      case 'users':
        return <User/>
      case 'page':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'design':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z" />
          </svg>
        )
      default:
        return null
    }
  }

  const handleLoginClick = () => {
    // 로그인 페이지로 이동
    window.location.href = '/login'
  }

  const handleLogout = async () => {
    try {
      await logout()
      setDropdownOpen(false)
    } catch (error) {
      console.error('로그아웃 실패:', error)
      alert('로그아웃에 실패했습니다.')
    }
  }

  // 사용자 아바타 텍스트 생성
  const getUserAvatarText = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase()
    }
    return 'U'
  }

  // 모바일 메뉴 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen &&
          mobileMenuRef.current &&
          !mobileMenuRef.current.contains(event.target) &&
          mobileMenuButtonRef.current &&
          !mobileMenuButtonRef.current.contains(event.target)) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mobileMenuOpen])

  return (
    <header className="h-16 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* 좌측 제목 및 네비게이션 */}
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link to="/" className="text-lg sm:text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
              STG Academy
            </Link>

            {/* 데스크톱 네비게이션 메뉴 (로그인된 상태에서만 표시) */}
            {isAuthenticated && (
              <nav className="hidden lg:flex space-x-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isCurrentPage(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {renderIcon(item.icon)}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            )}

            {/* 회원가입 필요 알림 - 데스크톱에서만 표시 */}
            {needsRegistration && (
              <div className="hidden md:block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <p className="text-sm text-blue-700">
                  회원가입을 완료해주세요
                </p>
              </div>
            )}
          </div>

          {/* 우측 사용자 메뉴/알림 */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* 모바일 메뉴 버튼 */}
            {isAuthenticated && (
              <button
                ref={mobileMenuButtonRef}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="메뉴 열기"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}

            {/* 로그인 상태에 따른 분기 */}
            {!isAuthenticated && !needsRegistration ? (
              /* 로그인하지 않은 상태 */
              <Link
                to="/login"
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                <span className="hidden sm:inline">회원가입/</span>로그인
              </Link>
            ) : needsRegistration ? (
              /* 회원가입 필요 상태 */
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="hidden sm:block text-sm text-blue-600 font-medium">
                  {user?.username || '사용자'}님
                </span>
                <div className="flex space-x-1 sm:space-x-2">
                  <Link
                    to="/auth/complete-registration"
                    className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">회원가입 </span>완료
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="text-gray-600 hover:text-gray-700 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-60"
                    title="로그아웃"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              /* 로그인한 상태 */
              <>
                {/* 알림 아이콘 */}
                <div className="relative hidden sm:block">
                  <button
                    className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    aria-label="알림"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 21l4-7h8l-4 7H8z" />
                    </svg>
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* 사용자 프로필 드롭다운 */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-1 sm:space-x-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                    aria-label="사용자 메뉴"
                  >
                    {/* 프로필 이미지 또는 아바타 */}
                    {user?.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt="프로필"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">{getUserAvatarText()}</span>
                      </div>
                    )}
                    <span className="hidden md:block text-sm">{user?.username || '사용자'}</span>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* 드롭다운 메뉴 */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-3 sm:px-4 py-2 text-sm text-gray-900 border-b border-gray-200">
                        <div className="font-medium truncate">{user?.username || '사용자'}</div>
                        {user?.email && (
                          <div className="text-gray-500 text-xs truncate">{user.email}</div>
                        )}
                      </div>
                      <a
                        href="#"
                        className="block px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={(e) => e.preventDefault()}
                      >
                        프로필
                      </a>
                      <a
                        href="#"
                        className="block px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={(e) => e.preventDefault()}
                      >
                        설정
                      </a>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        disabled={isLoading}
                        className="w-full text-left px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
                      >
                        {isLoading ? '로그아웃 중...' : '로그아웃'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 모바일 네비게이션 메뉴 */}
        {isAuthenticated && mobileMenuOpen && (
          <div ref={mobileMenuRef} className="lg:hidden absolute top-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <nav className="px-4 py-3 space-y-1">
              {/* 회원가입 필요 알림 - 모바일 */}
              {needsRegistration && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 text-center">
                    {user?.username || '사용자'}님, 회원가입을 완료해주세요
                  </p>
                </div>
              )}

              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isCurrentPage(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {renderIcon(item.icon)}
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* 모바일 알림 */}
              <button
                className="flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 21l4-7h8l-4 7H8z" />
                  </svg>
                  <span>알림</span>
                </div>
                {notificationCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header