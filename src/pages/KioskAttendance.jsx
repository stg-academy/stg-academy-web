import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/mobile/ui/button';
import { Card, CardContent } from '../components/mobile/ui/card';
import { getSession } from '../services/sessionService';
import { getEnrollsBySession } from '../services/enrollService';
import { createOrUpdateAttendance, getAttendancesByLecture } from '../services/attendanceService';
import { getLecturesBySession } from '../services/lectureService';
import { getUsersInfo } from '../services/userService';

const XIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const BackspaceIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2H10.828a2 2 0 00-1.414.586L3 12z" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ChevronLeftIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

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
      await createOrUpdateAttendance(
        todaysLecture.id,
        selectedUser.id,
        'PRESENT'
      );

      setAttendanceStatus('success');

      // 사용자 목록 업데이트
      setAllUsers(prev => prev.map(user =>
        user.id === selectedUser.id
          ? { ...user, attendance: { status: 'PRESENT', created_at: new Date().toISOString() } }
          : user
      ));

      // 3초 후 초기 화면으로 돌아가기
      setTimeout(() => {
        setAttendanceStatus(null);
        setSelectedUser(null);
        setSearchQuery('');
      }, 3000);

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

  // 뒤로가기 처리
  const handleGoBack = useCallback(() => {
    if (selectedUser) {
      setSelectedUser(null);
    } else {
      navigate(-1);
    }
  }, [selectedUser, navigate]);

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-xl text-slate-600">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-8">
        <div className="bg-white rounded-3xl p-12 shadow-2xl text-center max-w-md w-full">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckIcon className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">출석 완료!</h1>
          <p className="text-lg text-slate-600 mb-2">{selectedUser.username}님</p>
          <p className="text-sm text-slate-500">출석이 성공적으로 처리되었습니다.</p>
        </div>
      </div>
    );
  }

  // 사용자 확인 화면
  if (selectedUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white rounded-3xl p-12 shadow-2xl text-center max-w-lg w-full">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={handleGoBack}
                className="p-3 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronLeftIcon className="h-6 w-6 text-slate-600" />
              </button>
              <div className="w-12"></div>
            </div>

            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-4xl font-bold text-blue-600">
                {selectedUser.username?.charAt(0) || '?'}
              </span>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {selectedUser.username || '이름 없음'}님
            </h2>

            {selectedUser.information && (
                <div className="text-lg text-gray-600 mb-8">{selectedUser.information}</div>
            )}

            <Button
              onClick={handleAttendanceConfirm}
              disabled={isProcessing || !todaysLecture}
              className="w-full h-16 text-xl font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isProcessing ? '처리 중...' : '출석 체크'}
            </Button>

            {!todaysLecture && (
              <p className="text-red-500 text-sm mt-4">오늘 예정된 강의가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 메인 검색 화면
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 상단 헤더 - 강의정보 영역 */}
      <div className="bg-white shadow-sm p-6 flex items-center justify-between">
        <button
          onClick={handleGoBack}
          className="p-3 hover:bg-slate-100 rounded-full transition-colors"
        >
          <XIcon className="h-6 w-6 text-slate-600" />
        </button>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">{sessionInfo?.title} 출석체크</h1>
          {todaysLecture ? (
            <p className="text-lg text-slate-500 mt-2">
              {formatDate(todaysLecture.lecture_date)} {sessionInfo?.title}
            </p>
          ) : (
            <p className="text-lg text-red-500 text-sm mt-4">오늘 예정된 강의가 없습니다.</p>
          )}
        </div>
        <div className="w-12"></div>
      </div>

      {/* 검색창 */}
      <div className="bg-white p-6 border-b border-slate-100">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름을 검색하거나 아래 키패드를 사용하세요"
            className="w-full h-16 px-6 pr-16 text-lg border border-slate-300 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <XIcon className="h-6 w-6 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border-slate-50 p-6">
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
                    className={`p-4 border-slate-50 rounded-lg cursor-pointer transition-all ${
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

      {/* 하단 키패드 영역 */}
      <div className="bg-white border-t border-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-5 gap-3 mb-4">
            {KOREAN_CONSONANTS.map((consonant) => (
              <Button
                key={consonant}
                onClick={() => handleKeypadInput(consonant)}
                variant="outline"
                className="h-16 text-xl font-bold border-none hover:bg-blue-50 hover:border-blue-300 active:scale-95 transition-all shadow-sm"
              >
                {consonant}
              </Button>
            ))}

            {/* 백스페이스 버튼 */}
            <Button
              onClick={handleBackspace}
              variant="outline"
              className="h-16 px-8 hover:bg-red-50 hover:border-red-300 active:scale-95 transition-all"
            >
              <BackspaceIcon className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KioskAttendance;