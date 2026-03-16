import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MobileLayout } from '../components/mobile/MobileLayout';
import { Card, CardContent } from '../components/mobile/ui/card';
import { Badge } from '../components/mobile/ui/badge';
import { getSessions } from '../services/sessionService';
import { getCourses } from '../services/courseService';
import { getEnrollsByUser } from '../services/enrollService';
import { useAuth } from '../contexts/AuthContext';
import { formatPeriod } from '../utils/renderUtils';

const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const getSessionBadge = (session) => {
  const { course_status, is_recruiting } = session;
  if (course_status === 'IN_PROGRESS' && is_recruiting) {
    return { variant: 'gray', label: '모집중', className: 'bg-yellow-100 text-yellow-700 border border-yellow-200' };
  }
  if (course_status === 'IN_PROGRESS') {
    return { variant: 'blue', label: '진행중', className: null };
  }
  if (course_status === 'FINISHED') {
    return { variant: 'green', label: '완료', className: null };
  }
  if (course_status === 'RECRUITING') {
    return { variant: 'gray', label: '모집예정', className: null };
  }
  return { variant: 'gray', label: '준비중', className: null };
};

const SORT_OPTIONS = [
  { value: 'default', label: '기본순' },
  { value: 'title', label: '제목순' },
  { value: 'newest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
];

const getSessionLink = (session, enrolledIds) => {
  if (enrolledIds.has(session.id)) return `/mobile/session/${session.id}`;
  if (session.is_recruiting) return `/mobile/recruit/${session.id}`;
  return `/mobile/info/${session.id}`;
};

export default function Search() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [courseMap, setCourseMap] = useState({});
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('default');

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const fetches = [getSessions(0, 200), getCourses()];
      if (user?.id) fetches.push(getEnrollsByUser(user.id));
      const [sessionsData, coursesData, enrollsData] = await Promise.all(fetches);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      const map = {};
      (Array.isArray(coursesData) ? coursesData : []).forEach(c => { map[c.id] = c.name || c.title; });
      setCourseMap(map);
      const ids = new Set(
        (Array.isArray(enrollsData) ? enrollsData : [])
          .filter(e => e.enroll_status === 'ACTIVE')
          .map(e => e.session_id)
      );
      setEnrolledIds(ids);
    } catch (err) {
      console.error('데이터 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...sessions];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(s => s.title?.toLowerCase().includes(q));
    }

    switch (sortOption) {
      case 'title':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'ko'));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.end_date || 0) - new Date(a.end_date || 0));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.end_date || 0) - new Date(b.end_date || 0));
        break;
      default:
        // 기본순: 모집중 우선 → end_date 내림차순 → 제목 오름차순
        result.sort((a, b) => {
          const aRecruiting = a.is_recruiting ? 0 : 1;
          const bRecruiting = b.is_recruiting ? 0 : 1;
          if (aRecruiting !== bRecruiting) return aRecruiting - bRecruiting;
          const aEnd = a.end_date ? new Date(a.end_date) : new Date(0);
          const bEnd = b.end_date ? new Date(b.end_date) : new Date(0);
          if (aEnd.getTime() !== bEnd.getTime()) return bEnd - aEnd;
          return (a.title || '').localeCompare(b.title || '', 'ko');
        });
        break;
    }

    return result;
  }, [sessions, searchQuery, sortOption]);

  return (
    <MobileLayout headerTitle="강좌 검색">
      <div className="flex flex-col h-full">

        {/* 검색 및 정렬 영역 */}
        <div className="px-5 pt-5 pb-3 space-y-3 bg-white ">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="강좌명으로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {loading ? '불러오는 중...' : `총 ${filteredAndSorted.length}개`}
            </span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="text-xs text-slate-600  rounded-md  py-1.5 bg-white focus:outline-none "
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 강좌 목록 */}
        <div className="flex flex-col flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-slate-500 text-sm">로딩 중...</p>
            </div>
          ) : filteredAndSorted.length > 0 ? (
            filteredAndSorted.map((session) => {
              const isEnrolled = enrolledIds.has(session.id);
              const badge = getSessionBadge(session);
              return (
                <Link to={getSessionLink(session, enrolledIds)} key={session.id}>
                  <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow active:scale-[0.99] transition-transform">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="space-y-1 flex-1 min-w-0 mr-3">
                        {courseMap[session.course_id] && (
                          <p className="text-xs text-slate-400 truncate">{courseMap[session.course_id]}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 truncate">{session.title}</h3>
                          {isEnrolled && <Badge variant="outline" className="flex-shrink-0">수강중</Badge>}
                        </div>
                        <p className="text-sm text-slate-500 truncate">수강기간: {formatPeriod(session)}</p>
                        {session.lecturer_info && (
                          <p className="text-xs text-slate-400 truncate">{session.lecturer_info}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <Badge variant={badge.variant} className={badge.className}>
                          {badge.label}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          ) : (
            <Card className="border-slate-100">
              <CardContent className="p-8 text-center">
                <p className="text-slate-500 text-sm">
                  {searchQuery ? `"${searchQuery}"에 대한 결과가 없어요` : '등록된 강좌가 없어요'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </MobileLayout>
  );
}
