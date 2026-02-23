import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MobileLayout } from '../components/mobile/MobileLayout.jsx';
import { Card, CardContent } from '../components/mobile/ui/card.jsx';
import { Button } from '../components/mobile/ui/button.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { authAPI } from '../services/authService.js';

const UserIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EditIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const SaveIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const LogoutIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default function Profile() {
  const { user, logout } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchUserInfo();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = await authAPI.getUserInfo();
      setUserInfo(userData);

      // 편집 폼 초기화
      const info = userData.information || {};
      setEditForm({
        name: info.name || '',
        email: info.email || '',
        phone: info.phone || '',
        department: info.department || '',
        position: info.position || ''
      });

    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      setError('사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // 취소 시 원래 데이터로 복원
      const info = userInfo.information || {};
      setEditForm({
        name: info.name || '',
        email: info.email || '',
        phone: info.phone || '',
        department: info.department || '',
        position: info.position || ''
      });
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // 업데이트할 정보 구성
      const updateData = {
        username: userInfo.username,
        information: editForm
      };

      // 기존 사용자 정보 업데이트인 경우
      if (userInfo.id) {
        updateData.existing_user_id = userInfo.id;
      }

      // API 호출 (register API를 사용하여 기존 사용자 정보 업데이트)
      await authAPI.register(updateData);

      // 성공 시 사용자 정보 다시 조회
      await fetchUserInfo();
      setIsEditing(false);
      alert('정보가 성공적으로 수정되었습니다.');

    } catch (error) {
      console.error('정보 수정 실패:', error);
      alert('정보 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('정말 로그아웃하시겠습니까?')) {
      try {
        await logout();
      } catch (error) {
        console.error('로그아웃 실패:', error);
        // 로그아웃은 실패해도 클라이언트에서 처리
      }
    }
  };

  const getLoginTypeDisplay = (authType) => {
    switch (authType) {
      case 'kakao':
        return '카카오 로그인';
      case 'credential':
        return '일반 로그인';
      default:
        return '알 수 없음';
    }
  };

  if (!user) {
    return (
      <MobileLayout headerTitle="내 정보">
        <div className="p-5 space-y-8">
          <section className="space-y-4">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">로그인이 필요합니다</h2>
              <p className="text-sm text-slate-500 mb-6">내 정보를 확인하려면 로그인해주세요</p>
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

  if (loading) {
    return (
      <MobileLayout headerTitle="내 정보">
        <div className="p-5 flex justify-center items-center h-64">
          <div className="text-slate-500">로딩 중...</div>
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout headerTitle="내 정보">
        <div className="p-5 space-y-4">
          <Card className="border-red-100">
            <CardContent className="p-6 text-center">
              <p className="text-red-600">{error}</p>
              <Button
                onClick={fetchUserInfo}
                className="mt-4"
                variant="outline"
              >
                다시 시도
              </Button>
            </CardContent>
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
          <Card className="border-blue-100 bg-blue-50/50">
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="h-10 w-10 text-blue-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-1">
                {userInfo?.information?.name || '이름 없음'}
              </h1>
              <p className="text-sm text-slate-600">
                {userInfo?.username || '사용자명 없음'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {getLoginTypeDisplay(userInfo?.auth_type)}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* 기본 정보 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">기본 정보</h2>
            <Button
              onClick={isEditing ? handleSave : handleEditToggle}
              size="sm"
              disabled={saving}
              className="flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                  저장 중...
                </>
              ) : isEditing ? (
                <>
                  <SaveIcon className="h-4 w-4 mr-1" />
                  저장
                </>
              ) : (
                <>
                  <EditIcon className="h-4 w-4 mr-1" />
                  편집
                </>
              )}
            </Button>
          </div>

          <Card>
            <CardContent className="p-5 space-y-4">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">이름</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="이름을 입력하세요"
                  />
                ) : (
                  <p className="text-slate-900">{userInfo?.information?.name || '입력되지 않음'}</p>
                )}
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">이메일</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="이메일을 입력하세요"
                  />
                ) : (
                  <p className="text-slate-900">{userInfo?.information?.email || '입력되지 않음'}</p>
                )}
              </div>

              {/* 전화번호 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">전화번호</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="전화번호를 입력하세요"
                  />
                ) : (
                  <p className="text-slate-900">{userInfo?.information?.phone || '입력되지 않음'}</p>
                )}
              </div>

              {/* 부서 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">부서</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="부서를 입력하세요"
                  />
                ) : (
                  <p className="text-slate-900">{userInfo?.information?.department || '입력되지 않음'}</p>
                )}
              </div>

              {/* 직급 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">직급</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="직급을 입력하세요"
                  />
                ) : (
                  <p className="text-slate-900">{userInfo?.information?.position || '입력되지 않음'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 편집 중일 때 취소 버튼 */}
          {isEditing && (
            <Button
              onClick={handleEditToggle}
              variant="outline"
              className="w-full"
              disabled={saving}
            >
              취소
            </Button>
          )}
        </section>

        {/* 로그아웃 */}
        <section>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center justify-center text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogoutIcon className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </section>

      </div>
    </MobileLayout>
  );
}