import {useState} from 'react'
import {useAuth} from '../contexts/AuthContext'
import SessionTable from '../components/tables/SessionTable.jsx'

const SessionListPage = () => {
    const {user} = useAuth()
    const [loading] = useState(false) // 향후 API 연동 시 사용

    // 강좌 목록 (임시 데이터)
    const sessions = [
        {
            id: 1,
            title: '교리반 1주차',
            course: '교리반 1학기 (4학점, 신학)',
            author: '이영규',
            sessionCount: 4
        },
        {
            id: 2,
            title: '교리반 2주차',
            course: '교리반 2학기 (...)',
            author: '이영규',
            sessionCount: 2
        },
        {
            id: 3,
            title: '교리반 3주차',
            course: '교리반 3학기 (...)',
            author: '이영규',
            sessionCount: 0
        },
        {
            id: 4,
            title: '재차반 1주차',
            course: '재차반 1학기 성경설명',
            author: '이영규',
            sessionCount: 8
        }
    ]

    // 세션수 클릭 핸들러
    const handleSessionCountClick = (lecture) => {
        // todo: 세션수 클릭 동작 추가
        console.log('세션수 클릭:', lecture)
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">강좌 목록</h3>
            </div>

            <SessionTable
                sessions={sessions}
                loading={loading}
                onSessionCountClick={handleSessionCountClick}
            />
        </div>
    )
}

export default SessionListPage