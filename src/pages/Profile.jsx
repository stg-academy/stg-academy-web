import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MobileLayout } from '../components/mobile/MobileLayout.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import { useToast } from '../components/ui/ToastProvider.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { updateUser, changePassword } from '../services/userService.js';
import { formatPhoneNumber, isValidPhoneNumber } from '../utils/phoneUtils.js';
import Icon from '../components/ui/Icon.jsx';

export default function Profile() {
  const { user, logout, refreshUser, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    information: '',
    phone_number: ''
  });
  const [saving, setSaving] = useState(false);
  const [phoneError, setPhoneError] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // 전체 로딩 상태 (AuthContext 로딩 + 개별 로딩)
  const isPageLoading = authLoading || loading;

  useEffect(() => {
    if (user) {
      // user 데이터로 편집 폼 초기화
      setEditForm({
        username: user.username || '',
        information: user.information || '',
        phone_number: user.phone_number || ''
      });
    }
  }, [user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // 취소 시 원래 데이터로 복원
      setEditForm({
        username: user.username || '',
        information: user.information || '',
        phone_number: user.phone_number || ''
      });
      setPhoneError(null);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhoneBlur = () => {
    if (!editForm.phone_number.trim()) {
      setPhoneError(null);
      return;
    }

    const formatted = formatPhoneNumber(editForm.phone_number);
    setEditForm(prev => ({ ...prev, phone_number: formatted }));
    setPhoneError(isValidPhoneNumber(formatted) ? null : '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)');
  };

  const handleSave = async () => {
    // 전화번호 형식 검사 — 형식에 맞지 않으면 저장하지 않음
    if (editForm.phone_number.trim() && !isValidPhoneNumber(formatPhoneNumber(editForm.phone_number))) {
      setPhoneError('올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)');
      return;
    }

    try {
      setSaving(true);

      // 업데이트할 정보 구성
      const updateData = {
        username: editForm.username,
        information: editForm.information,
        phone_number: editForm.phone_number
      };

      // updateUser API 사용
      await updateUser(user.id, updateData);

      // 사용자 정보 새로고침
      await refreshUser();

      setIsEditing(false);
      setPhoneError(null);
      toast.success('정보가 성공적으로 수정되었습니다.');

    } catch (error) {
      console.error('정보 수정 실패:', error);
      toast.error('정보 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordCancel = () => {
    setIsChangingPassword(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
    setPasswordError(null);
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);

    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setPasswordSaving(true);

      await changePassword(passwordForm.current, passwordForm.new);

      handlePasswordCancel();
      toast.success('비밀번호가 성공적으로 변경되었습니다.');

    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      if (error.status === 401) {
        setPasswordError('현재 비밀번호가 올바르지 않습니다.');
      } else {
        setPasswordError('비밀번호 변경 중 오류가 발생했습니다.');
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 로그아웃은 실패해도 클라이언트에서 처리
    }
  };

  const getLoginTypeDisplay = (authType) => {
    switch (authType) {
      case 'kakao':
        return '카카오 로그인';
      case 'normal':
        return '일반 로그인';
      default:
        return '알 수 없음';
    }
  };

  if (isPageLoading) {
    return (
        <MobileLayout headerTitle="내 정보">
          <div className="p-5 flex justify-center items-center h-64">
            <div className="text-neutral-500">로딩 중...</div>
          </div>
        </MobileLayout>
    );
  }

  if (!user) {
    return (
      <MobileLayout headerTitle="내 정보">
        <div className="p-5 space-y-8">
          <section className="space-y-4">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">로그인이 필요합니다</h2>
              <p className="text-sm text-neutral-500 mb-6">내 정보를 확인하려면 로그인해주세요</p>
              <Link to="/login">
                <Button className="w-full max-w-xs">
                  로그인하여 시작하기
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout headerTitle="내 정보">
        <div className="p-5 space-y-4">
          <Card className="border-error/20 text-center">
            <p className="text-error-text">{error}</p>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-5 space-y-6">

        {/* 프로필 헤더 */}
        <section>
          <Card className="border-none text-center">
              <div className="w-20 h-20 bg-accent-soft rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="user" size={40} className="text-accent" />
              </div>
              <h1 className="text-xl font-bold text-neutral-900 mb-1">
                {user?.username || '사용자명 없음'}
              </h1>
              <p className="text-sm text-neutral-600">
                {user?.information || '소속 정보 없음'}
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <p className="text-xs text-neutral-500">
                  {getLoginTypeDisplay(user?.auth_type)}
                </p>
                {user?.authorizations?.role && (
                  <>
                    <span className="text-xs text-neutral-400">•</span>
                    <span className="text-xs bg-accent-soft text-accent-hover px-2 py-1 rounded-full">
                      {user.authorizations.role}
                    </span>
                  </>
                )}
              </div>
          </Card>
        </section>

        {/* 내 수료증 진입 */}
        <section>
          <Link to="/mobile/certificates">
            <Card hover className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-soft rounded-full flex items-center justify-center flex-none">
                  <Icon name="award" size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">내 수료증</p>
                  <p className="text-xs text-neutral-500">발급받은 수료증을 확인하세요</p>
                </div>
              </div>
              <Icon name="chevron-right" size={16} className="text-neutral-400 flex-none" />
            </Card>
          </Link>
        </section>

        {/* 기본 정보 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900">기본 정보</h2>
            <Button
              onClick={isEditing ? handleSave : handleEditToggle}
              size="sm"
              disabled={saving || (isEditing && !!phoneError)}
              className="flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                  저장 중...
                </>
              ) : isEditing ? (
                <>
                  <Icon name="check" size={16} className="mr-1" />
                  저장
                </>
              ) : (
                <>
                  <Icon name="edit" size={16} className="mr-1" />
                  편집
                </>
              )}
            </Button>
          </div>

          <Card className="border-accent/20 bg-accent-soft/50 space-y-4">
              {/* 사용자명 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">사용자명</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-neutral-300"
                    placeholder="사용자명을 입력하세요"
                  />
                ) : (
                  <p className="text-neutral-900">{user?.username || '입력되지 않음'}</p>
                )}
              </div>

              {/* 소속 정보 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">소속 정보</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.information}
                    onChange={(e) => handleInputChange('information', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-neutral-300"
                    placeholder="소속 정보를 입력하세요 (예: 신촌 청년1부, 문래 장년부 등)"
                  />
                ) : (
                  <p className="text-neutral-900">{user?.information || '입력되지 않음'}</p>
                )}
              </div>

              {/* 전화번호 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">전화번호</label>
                {isEditing ? (
                  <>
                    <input
                      type="tel"
                      value={editForm.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      onBlur={handlePhoneBlur}
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-neutral-300 ${
                        phoneError ? 'border-error' : 'border-neutral-300'
                      }`}
                      placeholder="010-1234-5678"
                    />
                    {phoneError && (
                      <p className="mt-1 text-xs text-error-text">{phoneError}</p>
                    )}
                  </>
                ) : (
                  <p className="text-neutral-900">{user?.phone_number || '입력되지 않음'}</p>
                )}
              </div>
          </Card>
        </section>

        <section>
          {/* 편집 중일 때 취소 버튼 */}
          {isEditing && (
            <Button
              onClick={handleEditToggle}
              variant="secondary"
              className="w-full"
              disabled={saving}
            >
              취소
            </Button>
          )}
        </section>

        {/* 비밀번호 변경 (normal 계정만) */}
        {user.auth_type === 'normal' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-900">비밀번호 변경</h2>
              {!isChangingPassword && (
                <Button
                  onClick={() => setIsChangingPassword(true)}
                  size="sm"
                  className="flex items-center"
                >
                  <Icon name="edit" size={16} className="mr-1" />
                  변경
                </Button>
              )}
            </div>

            {isChangingPassword ? (
              <Card className="border-accent/20 bg-accent-soft/50 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">현재 비밀번호</label>
                    <input
                      type="password"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-neutral-300"
                      placeholder="현재 비밀번호를 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">새 비밀번호</label>
                    <input
                      type="password"
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-neutral-300"
                      placeholder="새 비밀번호를 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">새 비밀번호 확인</label>
                    <input
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-neutral-300"
                      placeholder="새 비밀번호를 다시 입력하세요"
                    />
                  </div>
                  {passwordError && (
                    <p className="text-sm text-error-text">{passwordError}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={handlePasswordChange}
                      disabled={passwordSaving}
                      className="flex-1 flex items-center justify-center"
                    >
                      {passwordSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                          저장 중...
                        </>
                      ) : (
                        <>
                          <Icon name="check" size={16} className="mr-1" />
                          저장
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handlePasswordCancel}
                      variant="secondary"
                      disabled={passwordSaving}
                      className="flex-1"
                    >
                      취소
                    </Button>
                  </div>
              </Card>
            ) : (
              <Card>
                <p className="text-sm text-neutral-500">비밀번호를 변경하려면 변경 버튼을 눌러주세요.</p>
              </Card>
            )}
          </section>
        )}

        {/* 로그아웃 */}
        <section>
          <Button
            onClick={() => setShowLogoutConfirm(true)}
            variant="secondary"
            className="w-full flex items-center justify-center text-error border-error/30 hover:bg-error-soft"
          >
            <Icon name="log-out" size={16} className="mr-2" />
            로그아웃
          </Button>
        </section>

      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="로그아웃"
        message="정말 로그아웃하시겠습니까?"
        confirmText="로그아웃"
        danger
      />
    </MobileLayout>
  );
}