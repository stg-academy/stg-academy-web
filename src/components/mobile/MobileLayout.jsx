import React from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext';
import Icon from '../ui/Icon.jsx';

const MobileLayout = ({
                          children,
                          showNav = true,
                          showBack = false,
                          rightAction
                      }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const {user} = useAuth();

    const navItems = [
        {icon: 'home', label: '홈', path: '/'},
        {icon: 'search', label: '찾기', path: '/mobile/search'},
        {icon: 'clipboard-check', label: '출석', path: '/mobile/attendance'},
        {icon: 'book-open', label: '내 강의', path: '/mobile/my-learning'},
    ];

    return (
        <div className="min-h-screen bg-neutral-50 flex justify-center">
            <div className="w-full max-w-md bg-white min-h-screen shadow-xl relative flex flex-col">


                {/* Main Content */}
                <main className={`flex-1 ${!showNav ? "pb-6" : "pb-20"}`}>
                    {children}
                </main>

                {/* Bottom Navigation */}
                {showNav && (
                    <nav
                        className="fixed bottom-0 w-full max-w-md bg-white border-t border-neutral-100 h-16 px-6 flex items-center justify-between z-50">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${
                                        isActive ? "text-accent" : "text-neutral-400 hover:text-neutral-600"
                                    }`}
                                >
                                    <Icon name={item.icon} size={24}/>
                                    <span className="text-[10px] font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                )}
            </div>
        </div>
    );
};

export {MobileLayout};