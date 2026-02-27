import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import SelectInput from '../forms/SelectInput';
import TextInput from '../forms/TextInput';
import { getUsersInfo } from '../../services/userService';
import { authAPI } from '../../services/authService';
import { createEnroll } from '../../services/enrollService';

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
  const [selectedOption, setSelectedOption] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserInfo, setNewUserInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [nameCheckLoading, setNameCheckLoading] = useState(false);
  const [isDuplicateName, setIsDuplicateName] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // 사용자 검색
  const handleNameSearch = async (searchValue = searchTerm) => {
    if (!searchValue.trim() || searchValue.length < 2) {
      return;
    }

    setSearchLoading(true);
    setError('');
    try {
      const users = await getUsersInfo(0, 1000);
      const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.information?.toLowerCase().includes(searchValue.toLowerCase())
      );

      setSearchResults(filteredUsers);
      setStep('register');
    } catch (err) {
      console.error('사용자 검색 실패:', err);
      setError('사용자 검색에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSearchLoading(false);
    }
  };

  // 검색어 변경 시 자동 검색
  useEffect(() => {
    if (step === 'search' && searchTerm.trim().length >= 2) {
      const debounceTimer = setTimeout(() => {
        handleNameSearch(searchTerm);
      }, 500); // 500ms 디바운싱

      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, step]);

  // 이름 중복 검사 (실시간)
  const checkNameDuplicate = async (name) => {
    if (!name.trim() || name.length < 1) {
      setIsDuplicateName(false);
      return;
    }

    setNameCheckLoading(true);
    try {
      // 전체 사용자 목록이 없으면 로드
      let users = allUsers;
      if (users.length === 0) {
        users = await getUsersInfo(0, 1000);
        setAllUsers(users);
      }

      const duplicateUser = users.find(user =>
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

  // 신규 사용자 이름 변경 시 중복 검사
  useEffect(() => {
    if (selectedOption === 'new' && newUserName.trim()) {
      const debounceTimer = setTimeout(() => {
        checkNameDuplicate(newUserName);
      }, 300); // 300ms 디바운싱

      return () => clearTimeout(debounceTimer);
    } else {
      setIsDuplicateName(false);
    }
  }, [newUserName, selectedOption, allUsers]);

  // 옵션 선택 처리
  const handleOptionChange = (value) => {
    setSelectedOption(value);
    if (value === 'new') {
      setNewUserName(searchTerm);
    } else {
      setNewUserName('');
      setNewUserInfo('');
    }
  };

  // 등록 처리
  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      let userId;

      if (selectedOption === 'new') {
        // 신규 사용자 등록
        if (!newUserName.trim()) {
          setError('이름을 입력해주세요');
          setLoading(false);
          throw error;
        }
        if (!newUserInfo.trim()) {
          setError('소속을 입력해주세요');
          setLoading(false);
          throw error;
        }

        // 이름 중복 최종 검사 (실시간 검사 결과 사용)
        if (isDuplicateName) {
          setError('이미 등록된 이름입니다');
          setLoading(false);
          throw new Error('중복된 이름');
        }

        // 신규 사용자 등록
        const newUserData = {
          username: newUserName.trim(),
          information: newUserInfo.trim(),
          auth: 'user'
        };

        const response = await authAPI.manualRegister(newUserData);
        userId = response.user.id;
      } else {
        // 기존 사용자 선택
        const selectedUser = searchResults.find(user => user.id === selectedOption);
        if (!selectedUser) {
          setError('사용자를 선택해주세요');
          setLoading(false);
          throw error;
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
      setError('등록에 실패했습니다. 다시 시도해주세요.');
      throw err;
      // 에러 시에는 모달을 닫지 않음
    } finally {
      setLoading(false);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    setStep('search');
    setSearchTerm('');
    setSearchResults([]);
    setSelectedOption('');
    setNewUserName('');
    setNewUserInfo('');
    setError('');
    setIsDuplicateName(false);
    setNameCheckLoading(false);
    onClose();
  };

  // 뒤로가기
  const handleBack = () => {
    if (step === 'register') {
      setStep('search');
      setSearchResults([]);
      setSelectedOption('');
      setNewUserName('');
      setNewUserInfo('');
      setError('');
      setIsDuplicateName(false);
      setNameCheckLoading(false);
    }
  };

  // 옵션 목록 생성
  const getOptions = () => {
    const options = searchResults.map(user => ({
      value: user.id,
      label: `${user.username} (${user.information || '정보 없음'})`
    }));

    options.push({
      value: 'new',
      label: '📝 신규 회원 등록하기'
    });

    return options;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'search' ? '회원 검색' : '회원 등록'}
      onSubmit={step === 'search' ? null : handleRegister}
      disabled={loading}
      submitText={'등록하기'}
      loadingText={'등록 중...'}
      showBackButton={step === 'register'}
      onBack={handleBack}
      showSubmitButton={step === 'register'}
    >
      <div className="space-y-4">
        {/* 에러 메시지 표시 */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {step === 'search' && (
          <>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름 조회 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name-search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                {searchLoading && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              등록하려는 회원의 이름을 입력해주세요. (2자 이상 입력 시 자동 검색)
            </p>
          </>
        )}

        {step === 'register' && (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                검색 결과: <strong>"{searchTerm}"</strong>
              </p>
              {searchResults.length > 0 && (
                <p className="text-sm text-blue-600">
                  {searchResults.length}명의 기존 회원을 찾았습니다.
                </p>
              )}
            </div>

            <SelectInput
              id="user-option"
              name="userOption"
              label="회원 선택"
              value={selectedOption}
              onChange={(e) => handleOptionChange(e.target.value)}
              options={getOptions()}
              placeholder="회원을 선택하거나 신규 등록을 선택하세요"
              required
            />

            {selectedOption === 'new' && (
              <>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="new-user-name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="이름을 입력하세요"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDuplicateName
                          ? 'border-red-300 bg-red-50'
                          : newUserName && !nameCheckLoading && !isDuplicateName
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300'
                      }`}
                      required
                    />
                    {nameCheckLoading && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    {!nameCheckLoading && newUserName && (
                      <div className="absolute right-3 top-3">
                        {isDuplicateName ? (
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                  {isDuplicateName && (
                    <p className="mt-1 text-sm text-red-600">이미 등록된 이름입니다</p>
                  )}
                  {!nameCheckLoading && newUserName && !isDuplicateName && newUserName.length > 0 && (
                    <p className="mt-1 text-sm text-green-600">사용 가능한 이름입니다</p>
                  )}
                </div>
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
          </>
        )}
      </div>
    </Modal>
  );
};

export default UserRegistrationModal;