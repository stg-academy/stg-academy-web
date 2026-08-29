import React, {useEffect, useRef, useState} from 'react'
import {Link, useLocation} from 'react-router-dom'
import {useAuth} from '../contexts/AuthContext'
import {isAdmin} from '../utils/roleUtils'
import {useToast} from './ui/ToastProvider.jsx'
import Icon from './ui/Icon.jsx'


const Header = () => {
    const {user, isAuthenticated, needsRegistration, isLoading, logout} = useAuth()
    const toast = useToast()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()
    const mobileMenuRef = useRef(null)
    const mobileMenuButtonRef = useRef(null)

    // 네비게이션 메뉴 (역할 기반 필터링)
    const getAllNavigationItems = () => [
        {name: '홈', href: '/', icon: 'home', adminOnly: false},
        {name: '출석', href: '/mobile/attendance', icon: 'check', adminOnly: false},
        {name: '내 강의', href: '/mobile/my-learning/', icon: 'book', adminOnly: false},
        // { name: '샘플 페이지', href: '/sample', icon: 'page', adminOnly: false },
        // { name: '디자인 가이드', href: '/design-guide', icon: 'design', adminOnly: false },
        {name: '강의 관리', href: '/courses/sessions', icon: 'settings', adminOnly: true},
        {name: '사용자 관리', href: '/users', icon: 'users', adminOnly: true}
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
                return <Icon name="home" size={16}/>
            case 'users':
                return <Icon name="users" size={16}/>
            case 'search':
                return <Icon name="search" size={16}/>
            case 'check':
                return <Icon name="clipboard-check" size={16}/>
            case 'book':
                return <Icon name="book-open" size={16}/>
            case 'settings':
                return <Icon name="settings" size={16}/>
            case 'management':
                return <Icon name="archive" size={16}/>
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
                            <div
                                className="hidden md:block bg-accent-soft border border-accent/20 rounded-lg px-4 py-2">
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
                                <Icon name={mobileMenuOpen ? 'x' : 'menu'} size={24}/>
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
                                            <div
                                                className="w-7 h-7 sm:w-8 sm:h-8 bg-accent rounded-full flex items-center justify-center">
                                                <span
                                                    className="text-white font-medium text-sm">{getUserAvatarText()}</span>
                                            </div>
                                        )}
                                        <span className="hidden lg:block text-sm">{user?.username || '사용자'}</span>
                                        <Icon name="chevron-down" className="w-3 h-3 sm:w-4 sm:h-4 hidden lg:block"/>
                                    </button>

                                    {/* 드롭다운 메뉴 */}
                                    {dropdownOpen && (
                                        <div
                                            className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
                                            <div
                                                className="px-3 sm:px-4 py-2 text-sm text-neutral-900 border-b border-neutral-200">
                                                <div className="font-medium truncate">{user?.username || '사용자'}</div>
                                                {user?.email && (
                                                    <div
                                                        className="text-neutral-500 text-xs truncate">{user.email}</div>
                                                )}
                                            </div>
                                            <Link
                                                to="/profile"
                                                className="block px-3 sm:px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                프로필
                                            </Link>
                                            <hr className="my-1 border-neutral-200"/>
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
                    <div ref={mobileMenuRef}
                         className="lg:hidden absolute top-16 left-0 right-0 bg-white border-t border-neutral-200 shadow-lg z-50">
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

                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}

export default Header