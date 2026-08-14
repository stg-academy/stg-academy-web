import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { startKakaoLogin } from '../config/kakao'
import { isAdmin } from '../utils/roleUtils'
import { useToast } from './ui/ToastProvider.jsx'



const Header = () => {
  const { user, isAuthenticated, needsRegistration, isLoading, logout } = useAuth()
  const toast = useToast()
  const [notificationCount] = useState(3)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const mobileMenuRef = useRef(null)
  const mobileMenuButtonRef = useRef(null)

  // 네비게이션 메뉴 (역할 기반 필터링)
  const getAllNavigationItems = () => [
    { name: '홈', href: '/', icon: 'home', adminOnly: false },
    { name: '출석', href: '/mobile/attendance', icon: 'check', adminOnly: false },
    { name: '내 강의', href: '/mobile/my-learning/', icon: 'book', adminOnly: false },
    // { name: '샘플 페이지', href: '/sample', icon: 'page', adminOnly: false },
    // { name: '디자인 가이드', href: '/design-guide', icon: 'design', adminOnly: false },
    { name: '강의 관리', href: '/courses/sessions', icon: 'settings', adminOnly: true },
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
      case 'home':
        return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="9"/>
              <rect x="14" y="3" width="7" height="5"/>
              <rect x="14" y="12" width="7" height="9"/>
              <rect x="3" y="16" width="7" height="5"/>
            </svg>
        )
      case 'users':
        return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
        )
      case 'search':
        return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
        )
      case 'check':
        return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
        )
      case 'book':
        return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
        )
      case 'settings':
        return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
        )
      case 'management':
        return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
        )
      default:
        return null
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setDropdownOpen(false)
    } catch (error) {
      console.error('로그아웃 실패:', error)
      toast.error('로그아웃에 실패했습니다.')
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
    <header className="h-16 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* 좌측 로고, 제목 및 네비게이션 */}
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <img
                src="/logo_grad.png"
                alt="STG Academy Logo"
                className="h-6 w-6"
              />
              <span className="text-lg sm:text-xl font-bold text-neutral-900 font-stg-title">
                시광 아카데미
              </span>
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
                        ? 'bg-neutral-100 text-neutral-900'
                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
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
              <div className="hidden md:block bg-accent-soft border border-accent/20 rounded-lg px-4 py-2">
                <p className="text-sm text-accent-hover">
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
                className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
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
            {isLoading ? (
              /* 로딩 중 */
              <div className="px-3 sm:px-4 py-2 text-sm text-neutral-500">
                로딩 중...
              </div>
            ) : !isAuthenticated && !needsRegistration ? (
              /* 로그인하지 않은 상태 */
              <Link
                to="/login"
                className="bg-accent text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-accent-hover transition-colors text-sm sm:text-base"
              >
                <span className="hidden sm:inline">회원가입/</span>로그인
              </Link>
            ) : needsRegistration ? (
              /* 회원가입 필요 상태 */
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="hidden sm:block text-sm text-accent font-medium">
                  {user?.username || '사용자'}님
                </span>
                <div className="flex space-x-1 sm:space-x-2">
                  <Link
                    to="/auth/complete-registration"
                    className="bg-accent text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-accent-hover transition-colors text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">회원가입 </span>완료
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="text-neutral-600 hover:text-neutral-700 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-60"
                    title="로그아웃"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              /* 로그인한 상태 */
              <>
                {/*/!* 알림 아이콘 *!/*/}
                {/*<div className="relative hidden sm:block">*/}
                {/*  <button*/}
                {/*    className="relative p-2 text-neutral-600 hover:text-neutral-900 transition-colors"*/}
                {/*    aria-label="알림"*/}
                {/*  >*/}
                {/*    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
                {/*      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 21l4-7h8l-4 7H8z" />*/}
                {/*    </svg>*/}
                {/*    {notificationCount > 0 && (*/}
                {/*      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">*/}
                {/*        {notificationCount}*/}
                {/*      </span>*/}
                {/*    )}*/}
                {/*  </button>*/}
                {/*</div>*/}

                {/* 사용자 프로필 드롭다운 */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-1 sm:space-x-2 text-sm text-neutral-700 hover:text-neutral-900 transition-colors"
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
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">{getUserAvatarText()}</span>
                      </div>
                    )}
                    <span className="hidden lg:block text-sm">{user?.username || '사용자'}</span>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* 드롭다운 메뉴 */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
                      <div className="px-3 sm:px-4 py-2 text-sm text-neutral-900 border-b border-neutral-200">
                        <div className="font-medium truncate">{user?.username || '사용자'}</div>
                        {user?.email && (
                          <div className="text-neutral-500 text-xs truncate">{user.email}</div>
                        )}
                      </div>
                      <Link
                        to="/profile"
                        className="block px-3 sm:px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        프로필
                      </Link>
                      <hr className="my-1 border-neutral-200" />
                      <button
                        onClick={handleLogout}
                        disabled={isLoading}
                        className="w-full text-left px-3 sm:px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-60"
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
          <div ref={mobileMenuRef} className="lg:hidden absolute top-16 left-0 right-0 bg-white border-t border-neutral-200 shadow-lg z-50">
            <nav className="px-4 py-3 space-y-1">
              {/* 회원가입 필요 알림 - 모바일 */}
              {needsRegistration && (
                <div className="mb-3 p-3 bg-accent-soft border border-accent/20 rounded-lg">
                  <p className="text-sm text-accent-hover text-center">
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
                      ? 'bg-neutral-100 text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  {renderIcon(item.icon)}
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* 모바일 알림 */}
              {/*<button*/}
              {/*  className="flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all duration-200"*/}
              {/*  onClick={() => setMobileMenuOpen(false)}*/}
              {/*>*/}
              {/*  <div className="flex items-center space-x-3">*/}
              {/*    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
              {/*      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 21l4-7h8l-4 7H8z" />*/}
              {/*    </svg>*/}
              {/*    <span>알림</span>*/}
              {/*  </div>*/}
              {/*  {notificationCount > 0 && (*/}
              {/*    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">*/}
              {/*      {notificationCount}*/}
              {/*    </span>*/}
              {/*  )}*/}
              {/*</button>*/}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header