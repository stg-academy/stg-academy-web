import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MobileLayout } from '../components/mobile/MobileLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/mobile/ui/tabs';
import { Card, CardContent } from '../components/mobile/ui/card';
import { Button } from '../components/mobile/ui/button';
import { Progress } from '../components/mobile/ui/progress';
import { useAuth } from '../contexts/AuthContext';
import { getEnrollsByUser } from '../services/enrollService';
import { getAttendancesBySession } from '../services/attendanceService';
import { getLecturesBySession } from '../services/lectureService';

const ChevronRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const BookOpenIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

export default function MyLearning() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [lectureData, setLectureData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchMyLearningData();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchMyLearningData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 사용자의 수강 신청 목록 조회
      const enrollmentsData = await getEnrollsByUser(user.id);
      setEnrollments(enrollmentsData || []);

      // API 응답이 배열이 아닌 경우 처리
      const enrollmentsArray = Array.isArray(enrollmentsData) ? enrollmentsData : [];

      // 각 강좌별 출석 데이터와 강의 데이터 조회
      const dataPromises = enrollmentsArray.map(async (enrollment) => {
        try {
          const [attendances, lectures] = await Promise.all([
            getAttendancesBySession(enrollment.session_id),
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
    const userAttendances = attendances.filter(att => att.user_id === user?.id && att.status === 'PRESENT');
    const totalLectures = lectures.length;

    if (totalLectures === 0) return 0;
    return Math.round((userAttendances.length / totalLectures) * 100);
  };

  const calculateProgress = (sessionId) => {
    const attendances = attendanceData[sessionId] || [];
    const lectures = lectureData[sessionId] || [];
    const userAttendances = attendances.filter(att => att.user_id === user?.id && att.status === 'PRESENT');
    const totalLectures = lectures.length;

    if (totalLectures === 0) return 0;
    return Math.round((userAttendances.length / totalLectures) * 100);
  };

  const getActiveEnrollments = () => {
    const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];
    return enrollmentsArray.filter(enrollment =>
      enrollment.enroll_status === 'ENROLLED' || enrollment.enroll_status === 'ACTIVE'
    );
  };

  const getCompletedEnrollments = () => {
    const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];
    return enrollmentsArray.filter(enrollment =>
      enrollment.enroll_status === 'COMPLETED'
    );
  };

  const CourseCard = ({ enrollment, isCompleted = false }) => {
    const lectures = lectureData[enrollment.session_id] || [];
    const attendances = attendanceData[enrollment.session_id] || [];
    const userAttendances = attendances.filter(att => att.user_id === user?.id && att.status === 'PRESENT');

    const totalLectures = lectures.length;
    const attendedLectures = userAttendances.length;
    const attendanceRate = calculateAttendanceRate(enrollment.session_id);
    const progress = calculateProgress(enrollment.session_id);
    return (
      <Card className="border-slate-100 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {enrollment.session_title || '강의명 없음'}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                진행도 ({attendedLectures}/{totalLectures}회차)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>출석률</span>
              <span className="font-medium text-slate-900">{attendanceRate}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {!isCompleted && (
            <Link to={`/course/${enrollment.session_id}`}>
              <Button className="w-full mt-2" variant="outline">
                강의실 입장
                <ChevronRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <MobileLayout headerTitle="내 강의">
        <div className="p-4 flex justify-center items-center h-64">
          <div className="text-slate-500">로딩 중...</div>
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
              <h2 className="text-2xl font-bold text-slate-900 mb-2">내 강의를 확인하세요</h2>
              <p className="text-sm text-slate-500 mb-6">로그인하여 수강 중인 강의와 진도를 확인해보세요</p>
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
        <div className="p-4 flex flex-col items-center justify-center h-64 text-slate-500">
          <p>{error}</p>
          <Button
            onClick={fetchMyLearningData}
            variant="outline"
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
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <BookOpenIcon className="h-8 w-8 text-slate-300" />
                </div>
                <p>현재 수강 중인 강의가 없습니다.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedEnrollments.length > 0 ? (
              completedEnrollments.map((enrollment) => (
                <CourseCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  isCompleted={true}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <BookOpenIcon className="h-8 w-8 text-slate-300" />
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