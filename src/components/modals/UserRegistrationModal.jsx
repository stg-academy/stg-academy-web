import React, {useEffect, useRef, useState} from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button.jsx';
import ErrorBanner from '../ui/ErrorBanner.jsx';
import TextInput from '../forms/TextInput';
import {searchUsers} from '../../services/userService';
import {authAPI} from '../../services/authService';
import {createEnroll} from '../../services/enrollService';
import Icon from '../ui/Icon.jsx';
import {formatNameWithPhone, formatPhoneNumber, isValidPhoneNumber} from '../../utils/phoneUtils.js';

const UserRegistrationModal = ({
                                   isOpen,
                                   onClose,
                                   sessionId,
                                   onUserRegistered,
                                   onError
                               }) => {
    const [step, setStep] = useState('search'); // 'search', 'register'
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newUserName, setNewUserName] = useState('');
    const [newUserPhone, setNewUserPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [newUserInfo, setNewUserInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [nameCheckLoading, setNameCheckLoading] = useState(false);
    const [isDuplicateName, setIsDuplicateName] = useState(false);
    const searchDebounceRef = useRef(null);

    // 사용자 검색 (서버사이드, 디바운스)
    const handleUserSearch = (term) => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

        if (!term || term.trim().length < 2) {
            setSearchResults([]);
            setShowUserDropdown(false);
            return;
        }

        searchDebounceRef.current = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const results = await searchUsers(term, 20);
                setSearchResults(results);
                setShowUserDropdown(results.length > 0);
            } catch (err) {
                console.error('사용자 검색 실패:', err);
                setError('사용자 검색에 실패했습니다. 다시 시도해주세요.');
            } finally {
                setSearchLoading(false);
            }
        }, 400);
    };

    // 검색 결과에서 사용자 선택
    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setSearchTerm(user.username);
        setShowUserDropdown(false);
    };

    // 선택된 사용자 해제
    const handleClearSelectedUser = () => {
        setSelectedUser(null);
        setSearchTerm('');
    };

    // 신규 사용자 등록 화면으로 이동
    const handleGoToNewUser = () => {
        setStep('register');
        setNewUserName(searchTerm);
        setNewUserPhone('');
        setPhoneError('');
        setSelectedUser(null);
        setShowUserDropdown(false);
        setError('');
    };

    // 이름 중복 검사 (실시간)
    const checkNameDuplicate = async (name) => {
        if (!name.trim() || name.length < 1) {
            setIsDuplicateName(false);
            return;
        }

        setNameCheckLoading(true);
        try {
            const results = await searchUsers(name, 20);
            const duplicateUser = results.find(user =>
                user.username?.trim().toLowerCase() === name.trim().toLowerCase()
            );

            setIsDuplicateName(!!duplicateUser);
        } catch (err) {
            console.error('이름 중복 검사 실패:', err);
            // 에러 시에는 중복 검사 결과를 초기화
            setIsDuplicateName(false);
        } finally {
            setNameCheckLoading(false);
        }
    };

    // 전화번호 입력 변경
    const handlePhoneChange = (e) => {
        setNewUserPhone(e.target.value);
        if (phoneError) setPhoneError('');
    };

    // 전화번호 입력 완료 시 포맷팅 + 검증
    const handlePhoneBlur = () => {
        if (!newUserPhone.trim()) return;
        const formatted = formatPhoneNumber(newUserPhone);
        setNewUserPhone(formatted);
        setPhoneError(isValidPhoneNumber(formatted) ? '' : '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)');
    };

    // 신규 사용자 이름 변경 시 중복 검사
    useEffect(() => {
        if (step === 'register' && newUserName.trim()) {
            const debounceTimer = setTimeout(() => {
                checkNameDuplicate(newUserName);
            }, 300); // 300ms 디바운싱

            return () => clearTimeout(debounceTimer);
        } else {
            setIsDuplicateName(false);
        }
    }, [newUserName, step]);

    // 등록 처리
    const handleRegister = async () => {
        setLoading(true);
        setError('');
        try {
            let userId;

            if (step === 'register') {
                // 신규 사용자 등록
                if (!newUserName.trim()) {
                    setError('이름을 입력해주세요');
                    setLoading(false);
                    return;
                }
                if (!newUserInfo.trim()) {
                    setError('소속을 입력해주세요');
                    setLoading(false);
                    return;
                }
                if (!newUserPhone.trim()) {
                    setError('전화번호를 입력해주세요');
                    setLoading(false);
                    return;
                }
                const formattedPhone = formatPhoneNumber(newUserPhone);
                if (!isValidPhoneNumber(formattedPhone)) {
                    setPhoneError('올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)');
                    setError('전화번호를 올바르게 입력해주세요');
                    setLoading(false);
                    return;
                }

                // 이름 중복 최종 검사 (실시간 검사 결과 사용)
                if (isDuplicateName) {
                    setError('이미 등록된 이름입니다');
                    setLoading(false);
                    return;
                }

                const newUserData = {
                    username: newUserName.trim(),
                    information: newUserInfo.trim(),
                    phone_number: formattedPhone,
                    auth: 'user'
                };

                const response = await authAPI.manualRegister(newUserData);
                userId = response.user.id;
            } else {
                // 기존 사용자 선택
                if (!selectedUser) {
                    setError('사용자를 선택해주세요');
                    setLoading(false);
                    return;
                }
                userId = selectedUser.id;
            }

            // 수강 등록
            await createEnroll({
                user_id: userId,
                session_id: sessionId,
                enroll_status: 'ACTIVE'
            });

            // 성공 시에만 모달 닫기
            onUserRegistered();
            handleClose();
        } catch (err) {
            console.error('등록 실패:', err);
            if (err.status === 409 && /phone/i.test(err.message || '')) {
                setPhoneError('이미 등록된 전화번호입니다');
                setError('이미 등록된 전화번호입니다');
            } else if (err.status === 409) {
                setError('이미 등록된 이름입니다');
            } else {
                setError('등록에 실패했습니다. 다시 시도해주세요.');
            }
            // 에러 시에는 모달을 닫지 않음
        } finally {
            setLoading(false);
        }
    };

    // 모달 닫기
    const handleClose = () => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        setStep('search');
        setSearchTerm('');
        setSearchResults([]);
        setShowUserDropdown(false);
        setSelectedUser(null);
        setNewUserName('');
        setNewUserPhone('');
        setPhoneError('');
        setNewUserInfo('');
        setError('');
        setIsDuplicateName(false);
        setNameCheckLoading(false);
        onClose();
    };

    // 뒤로가기 (신규 등록 -> 검색)
    const handleBack = () => {
        if (step === 'register') {
            setStep('search');
            setNewUserName('');
            setNewUserPhone('');
            setPhoneError('');
            setNewUserInfo('');
            setError('');
            setIsDuplicateName(false);
            setNameCheckLoading(false);
        }
    };

    const footer = step === 'register' ? (
        <div className="flex gap-2">
            <Button variant="secondary" onClick={handleBack} disabled={loading} className="flex-1">
                돌아가기
            </Button>
            <Button onClick={handleRegister} disabled={loading} className="flex-1">
                {loading ? '등록 중...' : '등록하기'}
            </Button>
        </div>
    ) : selectedUser ? (
        <Button onClick={handleRegister} disabled={loading} className="w-full">
            {loading ? '등록 중...' : '등록하기'}
        </Button>
    ) : undefined;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={step === 'search' ? '회원 검색' : '회원 등록'}
            disabled={loading}
            footer={footer}
        >
            <div className="space-y-4">
                {/* 에러 메시지 표시 */}
                <ErrorBanner message={error}/>

                {step === 'search' && (
                    <>
                        <div className="relative">
                            <label className="block text-label font-medium text-neutral-700 mb-1.5">
                                이름 조회 <span className="text-error ml-1">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="name-search"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        handleUserSearch(e.target.value);
                                    }}
                                    placeholder="이름을 입력하세요"
                                    className="w-full h-10 px-3 rounded-md border text-sm outline-none transition-colors bg-white text-neutral-900 border-neutral-300 focus:border-info focus:shadow-[0_0_0_3px_var(--color-accent-soft)]"
                                    required
                                />
                                {searchLoading && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div
                                            className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                                    </div>
                                )}
                            </div>

                            {/* 검색 결과 드롭다운 */}
                            {showUserDropdown && searchResults.length > 0 && (
                                <div
                                    className="absolute z-50 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {searchResults.map((user) => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => handleSelectUser(user)}
                                            className="w-full px-4 py-3 text-left hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0"
                                        >
                                            <div className="flex flex-col">
                                                <span
                                                    className="font-medium text-neutral-900">{formatNameWithPhone(user.username, user.phone_number)}</span>
                                                {user.information && (
                                                    <span
                                                        className="text-xs text-neutral-400">{user.information}</span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* 선택된 사용자 표시 */}
                            {selectedUser && (
                                <div className="mt-2 p-3 bg-accent-soft border border-accent/20 rounded-md">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-accent-hover">
                                                선택된 사용자: {formatNameWithPhone(selectedUser.username, selectedUser.phone_number)}
                                            </p>
                                            {selectedUser.information && (
                                                <p className="text-xs text-accent">{selectedUser.information}</p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleClearSelectedUser}
                                            className="text-accent hover:text-accent-hover"
                                        >
                                            <Icon name="x" size={16}/>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <p className="mt-1.5 text-micro text-neutral-500">
                                2글자 이상 입력하면 검색 결과가 표시됩니다.
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleGoToNewUser}
                            className="w-full flex items-center justify-center gap-2"
                        >
                            <Icon name="plus" size={16}/>
                            새로운 사용자 추가하기
                        </Button>
                    </>
                )}

                {step === 'register' && (
                    <>
                        <div className="relative">
                            <label className="block text-label font-medium text-neutral-700 mb-1.5">
                                이름 <span className="text-error ml-1">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="new-user-name"
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    placeholder="이름을 입력하세요"
                                    className={`w-full h-10 px-3 rounded-md border text-sm outline-none transition-colors ${
                                        isDuplicateName
                                            ? 'border-error bg-error-soft text-neutral-900'
                                            : newUserName && !nameCheckLoading && !isDuplicateName
                                                ? 'border-success bg-success-soft text-neutral-900'
                                                : 'bg-white text-neutral-900 border-neutral-300 focus:border-info focus:shadow-[0_0_0_3px_var(--color-accent-soft)]'
                                    }`}
                                    required
                                />
                                {nameCheckLoading && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div
                                            className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                                    </div>
                                )}
                                {!nameCheckLoading && newUserName && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {isDuplicateName ? (
                                            <Icon name="x" size={16} className="text-error"/>
                                        ) : (
                                            <Icon name="check" size={16} className="text-success"/>
                                        )}
                                    </div>
                                )}
                            </div>
                            {isDuplicateName && (
                                <p className="mt-1.5 text-micro text-error-text">이미 등록된 이름입니다</p>
                            )}
                            {!nameCheckLoading && newUserName && !isDuplicateName && newUserName.length > 0 && (
                                <p className="mt-1.5 text-micro text-success-text">사용 가능한 이름입니다</p>
                            )}
                        </div>
                        <TextInput
                            id="new-user-phone"
                            name="newUserPhone"
                            label="전화번호"
                            value={newUserPhone}
                            onChange={handlePhoneChange}
                            onBlur={handlePhoneBlur}
                            placeholder="010-1234-5678"
                            error={phoneError}
                            required
                        />
                        <TextInput
                            id="new-user-info"
                            name="newUserInfo"
                            label="소속"
                            value={newUserInfo}
                            onChange={(e) => setNewUserInfo(e.target.value)}
                            placeholder="소속을 입력하세요 (예: 문래 장년부, 신촌 청년1부, 교역자 등)"
                            required
                        />
                    </>
                )}
            </div>
        </Modal>
    );
};

export default UserRegistrationModal;
