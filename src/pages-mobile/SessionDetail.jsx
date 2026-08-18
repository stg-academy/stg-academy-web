import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MobileLayout } from '../components/mobile/MobileLayout';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Progress from '../components/ui/Progress.jsx';
import { useAuth } from '../contexts/AuthContext';
import { getLecturesBySession } from '../services/lectureService';
import { getMyAttendancesBySession, createOrUpdateAttendance, createAttendanceWithCode } from '../services/attendanceService';
import { getSession } from '../services/sessionService';
import { getMyCertifications, getMyCertificationPreview, getMyCertificationDownload } from '../services/certificationService';
import { ATTENDANCE_CONFIG } from '../utils/attendanceStatus';
import { renderWithLinks } from '../utils/renderUtils';
import AttendanceCodeModal from '../components/mobile/AttendanceCodeModal';
import { useToast } from '../components/ui/ToastProvider.jsx';

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// 다운로드 헤더 파싱에 실패했을 때 쓰는 클라이언트 생성 파일명 (백엔드 규칙과 동일)
const buildFallbackFilename = (cert) => {
  const safeCourse = (cert.course_title || '수료증').replace(/[\\/:*?"<>|\s]+/g, '_');
  const yyyymmdd = cert.issued_at ? new Date(cert.issued_at).toISOString().slice(0, 10).replace(/-/g, '') : '';
  return `certification_${safeCourse}_${yyyymmdd}.png`;
};

const getCourseStatusBadge = (status) => {
  if (status === 'IN_PROGRESS') return { tone: 'info', label: '진행중', cardBorder: 'border-accent/20', cardBg: 'bg-accent-soft/50', accentText: 'text-accent' }
  if (status === 'FINISHED') return { tone: 'success', label: '완료', cardBorder: 'border-success/20', cardBg: 'bg-success-soft/50', accentText: 'text-success-text' }
  if (status === 'RECRUITING') return { tone: 'neutral', label: '모집중', cardBorder: 'border-neutral-200', cardBg: 'bg-neutral-50/50', accentText: 'text-neutral-600' }
  return { tone: 'neutral', label: '알 수 없음', cardBorder: 'border-neutral-200', cardBg: 'bg-neutral-50/50', accentText: 'text-neutral-600' }
}

export default function SessionDetail() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [lectures, setLectures] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingIn, setCheckingIn] = useState(null);
  const [attendanceModal, setAttendanceModal] = useState({ isOpen: false, lecture: null });
  const [certification, setCertification] = useState(null);
  const [certificatePreviewUrl, setCertificatePreviewUrl] = useState(null);
  const [certificatePreviewLoading, setCertificatePreviewLoading] = useState(false);
  const [certificateDownloading, setCertificateDownloading] = useState(false);

  useEffect(() => {
    if (sessionId && user?.id) {
      fetchSessionData();
    } else {
      setLoading(false);
    }
  }, [sessionId, user?.id]);

  // 이 세션의 수료증이 있으면 미리보기 이미지 로드 (페이지 본문 로딩과 분리, 실패해도 나머지는 정상 표시)
  useEffect(() => {
    if (!certification) return;

    let cancelled = false;
    setCertificatePreviewLoading(true);
    getMyCertificationPreview(certification.id)
      .then(({ blob }) => {
        if (!cancelled) setCertificatePreviewUrl(URL.createObjectURL(blob));
      })
      .catch((err) => {
        console.error('수료증 미리보기 조회 실패:', err);
      })
      .finally(() => {
        if (!cancelled) setCertificatePreviewLoading(false);
      });

    return () => { cancelled = true; };
  }, [certification]);

  // 언마운트 시 생성해둔 미리보기 object URL 정리
  useEffect(() => {
    return () => {
      if (certificatePreviewUrl) URL.revokeObjectURL(certificatePreviewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 세션 정보, 강의 목록, 출석 기록, 내 수료증 목록을 병렬로 조회
      const [sessionData, lecturesData, attendancesData, certificationsData] = await Promise.all([
        getSession(sessionId),
        getLecturesBySession(sessionId),
        getMyAttendancesBySession(sessionId),
        getMyCertifications()
      ]);

      // 세션 정보 설정
      setSessionInfo({
        title: sessionData?.title || '강의명 없음',
        description: sessionData?.description || '',
        course_status: sessionData?.course_status || null,
      });

      setLectures(Array.isArray(lecturesData) ? lecturesData : []);
      setAttendances(Array.isArray(attendancesData) ? attendancesData : []);

      const matchedCertification = (Array.isArray(certificationsData) ? certificationsData : [])
        .find(cert => cert.session_id === sessionId);
      setCertification(matchedCertification || null);

    } catch (error) {
      console.error('세션 데이터 조회 실패:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getUserAttendanceForLecture = (lectureId) => {
    return attendances.find(att => att.lecture_id === lectureId);
  };

  const getAttendanceStatus = (attendance) => {
    if (!attendance) {
      return {
        label: '출석 안함',
        color: 'text-neutral-500',
        bgColor: 'bg-neutral-50',
        borderColor: 'border-neutral-200',
        className: 'text-neutral-500'
      }
    }

    const detailType = attendance.detail_type || 'None'
    return ATTENDANCE_CONFIG[detailType]
  };

  const getAttendanceIcon = (detailType) => {
    switch (detailType) {
      case 'PRESENT':
      case 'ASSIGNMENT':
      case 'ALTERNATIVE':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'ABSENT':
        return <XCircleIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  };

  const calculateAttendanceStats = () => {
    const totalLectures = lectures.length;
    const presentCount = attendances.filter(att => att.status === 'PRESENT').length;

    return {
      totalLectures,
      presentCount,
      attendanceRate: totalLectures > 0 ? Math.round((presentCount / totalLectures) * 100) : 0
    };
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const lectureDate = new Date(dateString);

    return today.getFullYear() === lectureDate.getFullYear() &&
           today.getMonth() === lectureDate.getMonth() &&
           today.getDate() === lectureDate.getDate();
  };

  const canCheckAttendance = (lecture) => {
    const attendance = getUserAttendanceForLecture(lecture.id);
    return isToday(lecture.lecture_date) && !attendance;
  };

  // 출석 체크 모달 열기
  const handleShowAttendanceModal = (lecture) => {
    const attendance = getUserAttendanceForLecture(lecture.id);
    if (attendance) {
      toast.warning('이미 출석 처리된 강의입니다.');
      return;
    }
    setAttendanceModal({ isOpen: true, lecture });
  };

  // 출석 체크 모달 닫기
  const handleCloseAttendanceModal = () => {
    setAttendanceModal({ isOpen: false, lecture: null });
  };

  // 출석 체크 성공 처리
  const handleAttendanceSuccess = (newAttendance) => {
    // 출석 기록 업데이트
    setAttendances(prev => [...prev, newAttendance]);
    toast.success('출석이 완료되었습니다!');
  };

  // 수료증 다운로드
  const handleDownloadCertificate = async () => {
    if (!certification) return;

    setCertificateDownloading(true);
    try {
      const { blob, filename } = await getMyCertificationDownload(certification.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || buildFallbackFilename(certification);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('수료증 다운로드 실패:', err);
      toast.error('수료증 다운로드에 실패했습니다.');
    } finally {
      setCertificateDownloading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
        <MobileLayout headerTitle="강의 상세" showBack={true}>
          <div className="p-5 flex justify-center items-center h-64">
            <div className="text-neutral-500">로딩 중...</div>
          </div>
        </MobileLayout>
    );
  }

  if (!user) {
    return (
      <MobileLayout headerTitle="강의 상세" showBack={true}>
        <div className="p-5 space-y-8">
          <section className="space-y-4">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">로그인이 필요합니다</h2>
              <p className="text-sm text-neutral-500 mb-6">강의 정보를 확인하려면 로그인해주세요</p>
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
      <MobileLayout headerTitle="강의 상세" showBack={true}>
        <div className="p-5 space-y-4">
          <Card className="border-error/20 text-center">
            <p className="text-error-text">{error}</p>
            <Button
              onClick={fetchSessionData}
              className="mt-4"
              variant="secondary"
            >
              다시 시도
            </Button>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  const stats = calculateAttendanceStats();
  const { variant: statusVariant, label: statusLabel, cardBorder, cardBg, accentText } = getCourseStatusBadge(sessionInfo?.course_status);

  return (
    <MobileLayout headerTitle={sessionInfo?.title || "강의 상세"} showBack={true}>
      <div className="p-5 space-y-6">

        {/* 강의 정보 헤더 */}
        <section>
          <Card className={`${cardBorder} ${cardBg} space-y-4`}>
            <div>
              <h1 className="text-xl font-bold text-neutral-900 mb-2 truncate">
                {sessionInfo?.title || '강의명 없음'}
              </h1>
              {sessionInfo?.description && (
                <p className="text-sm text-neutral-600 mb-3 whitespace-pre-wrap leading-relaxed">
                  {renderWithLinks(sessionInfo.description)}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-600">
                총 {stats.totalLectures}회차 강의
              </div>
              <Badge tone={statusVariant}>{statusLabel}</Badge>
            </div>

            {/* 출석률 표시 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">출석률</span>
                <span className={`${accentText} font-bold`}>{stats.attendanceRate}%</span>
              </div>
              <Progress value={stats.attendanceRate} className="h-2" />
              <div className="text-xs text-neutral-500 text-center">
                {stats.presentCount}/{stats.totalLectures}회 출석
              </div>
            </div>
          </Card>
        </section>

        {/* 수료증 (발급된 경우에만 표시) */}
        {certification && (
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">수료증</h2>
            <Card className="space-y-4">
              <div className="w-full aspect-[2520/1000] bg-neutral-100 rounded-md overflow-hidden flex items-center justify-center">
                {certificatePreviewLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                ) : certificatePreviewUrl ? (
                  <img
                    src={certificatePreviewUrl}
                    alt={`${certification.course_title} 수료증`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-neutral-400">미리보기를 불러올 수 없습니다</span>
                )}
              </div>
              <p className="text-xs text-neutral-500 text-center">
                발급일: {formatDate(certification.issued_at)}
              </p>
              <Button
                className="w-full"
                disabled={certificateDownloading}
                onClick={handleDownloadCertificate}
              >
                {certificateDownloading ? '다운로드 중...' : '다운로드'}
              </Button>
            </Card>
          </section>
        )}

        {/* 출석 현황 */}
        <section>
          <h2 className="text-lg font-bold text-neutral-900 mb-4">출석 현황</h2>

          {lectures.length > 0 ? (
            <div className="flex flex-col space-y-3">
              {lectures
                .sort((a, b) => new Date(a.lecture_date) - new Date(b.lecture_date))
                .map((lecture, index) => {
                  const attendance = getUserAttendanceForLecture(lecture.id);
                  const status = getAttendanceStatus(attendance);
                  const icon = getAttendanceIcon(attendance?.detail_type || 'None');

                  return (
                    <Card
                      key={lecture.id}
                      className={`border ${status?.borderColor} bg-white`}
                    >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 mr-3">
                            <div className="flex items-center mb-2">
                              <span className="text-sm font-medium text-neutral-500 mr-2 flex-shrink-0">
                                {index + 1}회차
                              </span>
                              <h3 className="font-semibold text-neutral-900 truncate">
                                {lecture.title || `${index + 1}회차 강의`}
                              </h3>
                            </div>

                            <div className="flex items-center text-sm text-neutral-600 space-x-4">
                              <div className="flex items-center truncate">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {lecture.lecture_date ? formatDate(lecture.lecture_date) : '날짜 미정'}
                              </div>
                              {lecture.start_time && (
                                <div className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  {formatTime(lecture.start_time)}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {/* 출석 상태별 색상은 attendanceStatus.js의 별도 색상 체계를 그대로 사용 (v2 토큰 범위 밖) */}
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${status?.className} ${status?.bgColor} ${status?.borderColor}`}>
                              {icon}
                              <span className="ml-1">
                                {status?.label || '미확인'}
                              </span>
                            </span>

                            {/* 출석 체크 버튼 */}
                            {canCheckAttendance(lecture) && (
                              <button
                                type="button"
                                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border text-accent-hover bg-accent-soft border-accent/20"
                                onClick={() => handleShowAttendanceModal(lecture)}
                              >
                                <span className="ml-1">
                                 출석 체크
                                </span>
                              </button>
                            )}
                          </div>
                        </div>

                        {attendance?.created_at && (
                          <div className="mt-2 text-xs text-neutral-500 truncate">
                            체크 시간: {formatDate(attendance.created_at)} {formatTime(attendance.created_at)}
                          </div>
                        )}
                    </Card>
                  );
                })}
            </div>
          ) : (
            <Card>
              <p className="text-neutral-500 text-center">등록된 강의가 없습니다.</p>
            </Card>
          )}
        </section>

      </div>

      {/* 출석 체크 모달 */}
      <AttendanceCodeModal
        isOpen={attendanceModal.isOpen}
        onClose={handleCloseAttendanceModal}
        lecture={attendanceModal.lecture}
        user={user}
        onAttendanceSuccess={handleAttendanceSuccess}
      />
    </MobileLayout>
  );
}