const SessionStatusBadge = ({
                                status: status
                            }) => {

    let bgColor = 'bg-gray-100'
    let textColor = 'text-gray-800'
    let label = status || '대기'

    if (status === '진행중' || status === 'IN_PROGRESS') {
        bgColor = 'bg-blue-100'
        textColor = 'text-blue-800'
        label = '진행중'
    } else if (status === '완료' || status === 'FINISHED') {
        bgColor = 'bg-green-100'
        textColor = 'text-green-800'
        label = '완료'
    }

    return <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
            {label}
        </span>
}

export default SessionStatusBadge