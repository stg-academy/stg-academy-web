import { useEffect, useState } from 'react'
import SessionTable from '../components/tables/SessionTable.jsx'
import { getSessions } from '../services/sessionService'
import PageContainer from '../components/ui/PageContainer.jsx'
import ErrorBanner from '../components/ui/ErrorBanner.jsx'
import PageSectionHeader from '../components/ui/PageSectionHeader.jsx'

// 조교용 강좌 목록 — getSessions()가 백엔드에서 이미 assistant_session_ids 기준으로
// 스코프되어 내려오므로 프론트에서 별도 필터링 없이 그대로 사용한다.
const AssistantSessionListPage = () => {
    const [loading, setLoading] = useState(true)
    const [sessions, setSessions] = useState([])
    const [error, setError] = useState(null)

    useEffect(() => {
        loadSessions()
    }, [])

    const loadSessions = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getSessions()
            setSessions(data)
        } catch (err) {
            console.error('강좌 목록 로드 실패:', err)
            setError('강좌 목록을 불러오는데 실패했습니다')
        } finally {
            setLoading(false)
        }
    }

    return (
        <PageContainer>
            <ErrorBanner message={error} className="mb-6" />

            <PageSectionHeader title="내가 담당하는 강좌" />

            <SessionTable
                sessions={sessions}
                loading={loading}
            />
        </PageContainer>
    )
}

export default AssistantSessionListPage
