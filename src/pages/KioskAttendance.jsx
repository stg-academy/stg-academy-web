import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSession } from '../services/sessionService';
import { getEnrollsBySession } from '../services/enrollService';
import { createAttendance, getAttendancesByLecture } from '../services/attendanceService';
import { getLecturesBySession } from '../services/lectureService';
import { getUsersInfo } from '../services/userService';

const KioskAttendance = () => {
  const { session_id } = useParams();
  const navigate = useNavigate();
  const [sessionInfo, setSessionInfo] = useState(null);
  const [todaysLecture, setTodaysLecture] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 한글 자음 키패드
  const KOREAN_CONSONANTS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

  // 초성 추출 함수
  const getInitialConsonant = useCallback((char) => {
    const code = char.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) { // 한글 범위
      const index = Math.floor((code - 0xAC00) / 588);
      const consonants = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
      return consonants[index];
    }
    return '';
  }, []);

  // 초성 검색 함수
  const searchByInitials = useCallback((text, query) => {
    if (!query.trim()) return true;

    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();

    // 일반 텍스트 검색
    if (textLower.includes(queryLower)) return true;

    // 초성 검색
    const initials = text.split('').map(char => getInitialConsonant(char)).join('');
    return initials.includes(query);
  }, [getInitialConsonant]);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 세션 정보 로드
        const session = await getSession(session_id);
        setSessionInfo(session);

        // 오늘 강의 찾기
        const lectures = await getLecturesBySession(session_id);
        const today = new Date().toISOString().split('T')[0];
        const todayLecture = lectures.find(lecture => {
          if (lecture.lecture_date) {
            const lectureDate = new Date(lecture.lecture_date).toISOString().split('T')[0];
            return lectureDate === today;
          }
          return false;
        });

        if (!todayLecture) {
          setError('오늘 예정된 강의가 없습니다.');
          return;
        }

        setTodaysLecture(todayLecture);

        // 수강신청자 목록 로드
        const enrollments = await getEnrollsBySession(session_id);
        const activeEnrollments = enrollments.filter(e =>
          e.enroll_status === 'ENROLLED' || e.enroll_status === 'ACTIVE'
        );

        // 사용자 정보 로드
        const usersInfo = await getUsersInfo(0, 1000);
        const enrolledUsers = usersInfo.filter(user =>
          activeEnrollments.some(enrollment => enrollment.user_id === user.id)
        );

        // 출석 기록 확인
        const attendances = await getAttendancesByLecture(todayLecture.id);
        const usersWithAttendance = enrolledUsers.map(user => ({
          ...user,
          attendance: attendances.find(att => att.user_id === user.id)
        }));

        setAllUsers(usersWithAttendance);
        setFilteredUsers(usersWithAttendance);

      } catch (err) {
        console.error('데이터 로드 실패:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (session_id) {
      loadData();
    }
  }, [session_id]);

  // 검색 필터링
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(allUsers);
      return;
    }

    const filtered = allUsers.filter(user =>
      searchByInitials(user.username || '', searchQuery) ||
      searchByInitials(user.information || '', searchQuery)
    );

    setFilteredUsers(filtered);
  }, [searchQuery, allUsers, searchByInitials]);

  // 키패드 입력 처리
  const handleKeypadInput = useCallback((consonant) => {
    setSearchQuery(prev => prev + consonant);
  }, []);

  // 백스페이스 처리
  const handleBackspace = useCallback(() => {
    setSearchQuery(prev => prev.slice(0, -1));
  }, []);

  // 검색어 초기화
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // 사용자 선택 처리
  const handleUserSelect = useCallback((user) => {
    if (user.attendance) {
      alert('이미 출석 처리된 사용자입니다.');
      return;
    }
    setSelectedUser(user);
  }, []);

  // 출석 처리
  const handleAttendanceConfirm = useCallback(async () => {
    if (!selectedUser || !todaysLecture) return;

    setIsProcessing(true);
    try {
      const attendanceData = {
        user_id: selectedUser.id,
        status: 'PRESENT',
        detail_type: 'PRESENT'
      };

      await createAttendance(todaysLecture.id, attendanceData);

      setAttendanceStatus('success');

      // 사용자 목록 업데이트
      setAllUsers(prev => prev.map(user =>
        user.id === selectedUser.id
          ? { ...user, attendance: { status: 'PRESENT', created_at: new Date().toISOString() } }
          : user
      ));

    } catch (err) {
      console.error('출석 처리 실패:', err);
      setAttendanceStatus('error');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedUser, todaysLecture]);

  // 초기화 처리
  const handleReset = useCallback(() => {
    setSelectedUser(null);
    setAttendanceStatus(null);
    setSearchQuery('');
  }, []);

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={() => navigate(-1)}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 출석 완료 화면
  if (attendanceStatus === 'success' && selectedUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg border p-12 max-w-lg text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedUser.username}님</h2>
          <p className="text-xl text-gray-600 mb-6">
            {formatDate(todaysLecture.lecture_date)} {sessionInfo?.title}
          </p>
          <div className="text-2xl font-bold text-green-600 mb-8">출석체크 완료</div>
          <button
            onClick={handleReset}
            className="w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 사용자 확인 화면
  if (selectedUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg border p-12 max-w-lg text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedUser.username}님</h2>
          <div className="text-lg text-gray-600 mb-2">{selectedUser.information}</div>
          <p className="text-xl text-gray-600 mb-8">
            {formatDate(todaysLecture.lecture_date)} {sessionInfo?.title}
          </p>
          <div className="space-y-4">
            <button
              onClick={handleAttendanceConfirm}
              disabled={isProcessing}
              className="w-full px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xl font-bold disabled:opacity-50"
            >
              {isProcessing ? '처리 중...' : '출석체크'}
            </button>
            <button
              onClick={() => setSelectedUser(null)}
              className="w-full px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-lg"
            >
              다시 선택
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{sessionInfo?.title}</h1>
              <p className="text-gray-600">
                {todaysLecture?.lecture_date ? formatDate(todaysLecture.lecture_date) : ''} 출석체크
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 - 스크롤 가능 */}
      <div className="flex-1 overflow-hidden pb-60">
        <div className="max-w-7xl mx-auto px-8 py-8 h-full overflow-y-auto">
          {/* 검색 영역 */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">이름 검색</h2>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                placeholder="이름을 입력하거나 아래 키패드를 사용하세요"
                className="w-full px-6 py-4 text-2xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* 검색 결과 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">수강생 목록</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {filteredUsers.length}명
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      user.attendance
                        ? 'border-green-200 bg-green-50 opacity-60 cursor-not-allowed'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="text-lg font-bold text-gray-900 mb-1">{user.username}</div>
                    {user.information && (
                      <div className="text-sm text-gray-600 mb-2">{user.information}</div>
                    )}
                    <div className={`text-sm font-medium ${
                      user.attendance ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {user.attendance ? '출석완료' : '출석 대기'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 키패드 - 하단 고정 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-4">한글 자음 키패드</h2>
          <div className="grid grid-cols-7 gap-3">
            {KOREAN_CONSONANTS.map((consonant) => (
              <button
                key={consonant}
                onClick={() => handleKeypadInput(consonant)}
                className="h-16 bg-gray-100 hover:bg-gray-200 rounded-lg text-2xl font-bold text-gray-900 transition-colors active:bg-gray-300"
              >
                {consonant}
              </button>
            ))}
            <button
              onClick={handleBackspace}
              className="h-16 bg-red-100 hover:bg-red-200 rounded-lg text-gray-700 transition-colors active:bg-red-300 flex items-center justify-center"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KioskAttendance;