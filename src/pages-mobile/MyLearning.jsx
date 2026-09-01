import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MobileLayout } from '../components/mobile/MobileLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Progress from '../components/ui/Progress.jsx';
import { useAuth } from '../contexts/AuthContext';
import { getMyEnrolls } from '../services/enrollService';
import { getMyAttendancesBySession } from '../services/attendanceService';
import { getLecturesBySession } from '../services/lectureService';
import { getSessions } from '../services/sessionService';
import { getMyCertifications } from '../services/certificationService';
import Icon from '../components/ui/Icon.jsx';

export default function MyLearning() {
  const { user, isLoading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [lectureData, setLectureData] = useState({});
  const [sessionStatusMap, setSessionStatusMap] = useState({});
  const [certifiedSessionIds, setCertifiedSessionIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 인증 확인이 끝나기 전에 user?.id로 분기하면 아직 확정 안 된 null 상태를
  // "로그인 안 함"으로 잘못 판단해버리므로, authLoading이 끝난 뒤에만 분기한다.
  useEffect(() => {
    if (authLoading) return;
    if (user?.id) {
      fetchMyLearningData();
    } else {
      setLoading(false);
    }
  }, [authLoading, user?.id]);

  const fetchMyLearningData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 사용자의 수강 신청 목록 조회
      const enrollmentsData = await getMyEnrolls();
      setEnrollments(enrollmentsData || []);

      // 수강신청된 session_id 목록
      const enrolledSessionIds = new Set(
        (Array.isArray(enrollmentsData) ? enrollmentsData : []).map(e => e.session_id)
      );

      // 세션 전체 1회 조회 후 수강신청된 세션만 필터링하여 course_status 맵 생성
      const allSessions = await getSessions(0, 200);
      const statusMap = {};
      (Array.isArray(allSessions) ? allSessions : [])
        .filter(s => enrolledSessionIds.has(s.id))
        .forEach(s => { statusMap[s.id] = s.course_status; });
      setSessionStatusMap(statusMap);

      // API 응답이 배열이 아닌 경우 처리
      const enrollmentsArray = Array.isArray(enrollmentsData) ? enrollmentsData : [];

      // 각 강좌별 출석 데이터와 강의 데이터 조회
      const dataPromises = enrollmentsArray.map(async (enrollment) => {
        try {
          const [attendances, lectures] = await Promise.all([
            getMyAttendancesBySession(enrollment.session_id),
            getLecturesBySession(enrollment.session_id)
          ]);

          return {
            sessionId: enrollment.session_id,
            attendances: attendances || [],
            lectures: lectures || []
          };
        } catch (err) {
          console.error(`세션 ${enrollment.session_id}의 데이터 조회 실패:`, err);
          return {
            sessionId: enrollment.session_id,
            attendances: [],
            lectures: []
          };
        }
      });

      const dataResults = await Promise.all(dataPromises);
      const attendanceMap = {};
      const lectureMap = {};

      dataResults.forEach(result => {
        attendanceMap[result.sessionId] = result.attendances;
        lectureMap[result.sessionId] = result.lectures;
      });

      setAttendanceData(attendanceMap);
      setLectureData(lectureMap);

      // 수료증 발급 여부 조회 (배지 표시용, 실패해도 나머지 페이지 로드는 막지 않음)
      try {
        const certificationsData = await getMyCertifications();
        setCertifiedSessionIds(new Set(
          (Array.isArray(certificationsData) ? certificationsData : []).map(cert => cert.session_id)
        ));
      } catch (certErr) {
        console.error('수료증 목록 조회 실패:', certErr);
      }

    } catch (err) {
      console.error('내 강의 데이터 조회 실패:', err);
      setError('강의 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendanceRate = (sessionId) => {
    const attendances = attendanceData[sessionId] || [];
    const lectures = lectureData[sessionId] || [];
    const presentCount = attendances.filter(att => att.status === 'PRESENT').length;
    const totalLectures = lectures.length;

    if (totalLectures === 0) return 0;
    return Math.round((presentCount / totalLectures) * 100);
  };

  const calculateProgress = (sessionId) => {
    const lectures = lectureData[sessionId] || [];
    const totalLectures = lectures.length;
    if (totalLectures === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pastLectures = lectures.filter(l => l.lecture_date && new Date(l.lecture_date) < today).length;
    return Math.round((pastLectures / totalLectures) * 100);
  };

  const getPastLectureCount = (sessionId) => {
    const lectures = lectureData[sessionId] || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return lectures.filter(l => l.lecture_date && new Date(l.lecture_date) < today).length;
  };

  const getActiveEnrollments = () => {
    const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];
    return enrollmentsArray.filter(enrollment => {
      if (enrollment.enroll_status === 'INACTIVE') return false;
      const status = sessionStatusMap[enrollment.session_id];
      return status === 'IN_PROGRESS' || status === 'RECRUITING';
    });
  };

  const getCompletedEnrollments = () => {
    const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];
    return enrollmentsArray.filter(enrollment =>
      enrollment.enroll_status !== 'INACTIVE' &&
      sessionStatusMap[enrollment.session_id] === 'FINISHED'
    );
  };

  const CourseCard = ({ enrollment, isCompleted = false }) => {
    const totalLectures = (lectureData[enrollment.session_id] || []).length;
    const pastLectures = getPastLectureCount(enrollment.session_id);
    const attendanceRate = calculateAttendanceRate(enrollment.session_id);
    const progress = calculateProgress(enrollment.session_id);
    const isCertified = certifiedSessionIds.has(enrollment.session_id);

    return (
      <Card className="relative space-y-4">
        {isCertified && (
          <img
            src="/certification_badge.png"
            alt="수료증 발급됨"
            className="absolute top-2 right-2 w-10 h-auto drop-shadow"
          />
        )}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-neutral-900 text-lg truncate">
              {enrollment.session_title || '강의명 없음'}
            </h3>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500 truncate">진행도 ({pastLectures}/{totalLectures}회차)</span>
              <span className="text-accent font-bold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex justify-between text-sm pt-1">
            <span className="text-neutral-500">출석률</span>
            <span className="text-neutral-900 font-semibold">{attendanceRate}%</span>
          </div>
        </div>

        <Link to={`/mobile/session/${enrollment.session_id}`}>
          <Button className="w-full mt-2">
            강의실 입장
            <Icon name="chevron-right" className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </Card>
    );
  };

  if (authLoading || loading) {
    return (
      <MobileLayout headerTitle="내 강의">
        <div className="p-4 flex justify-center items-center h-64">
          <div className="text-neutral-500">로딩 중...</div>
        </div>
      </MobileLayout>
    );
  }

  if (!user) {
    return (
      <MobileLayout headerTitle="내 강의">
        <div className="p-5 space-y-8">
          <section className="space-y-4">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">내 강의를 확인하세요</h2>
              <p className="text-sm text-neutral-500 mb-6">로그인하여 수강 중인 강의와 진도를 확인해보세요</p>
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
      <MobileLayout headerTitle="내 강의">
        <div className="p-4 flex flex-col items-center justify-center h-64 text-neutral-500">
          <p>{error}</p>
          <Button
            onClick={fetchMyLearningData}
            className="mt-4"
          >
            다시 시도
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const activeEnrollments = getActiveEnrollments();
  const completedEnrollments = getCompletedEnrollments();

  return (
    <MobileLayout>
      <div className="p-4">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="active">수강중</TabsTrigger>
            <TabsTrigger value="completed">완료</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeEnrollments.length > 0 ? (
              activeEnrollments.map((enrollment) => (
                <CourseCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  isCompleted={false}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-400 space-y-3">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
                  <Icon name="book-open" size={32} className="text-neutral-300" />
                </div>
                <p>현재 수강 중인 강의가 없습니다.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedEnrollments.length > 0 ? (
              completedEnrollments.map((enrollment) => (
                <CourseCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  isCompleted={true}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-400 space-y-3">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
                  <Icon name="book-open" size={32} className="text-neutral-300" />
                </div>
                <p>아직 완료한 강의가 없습니다.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}