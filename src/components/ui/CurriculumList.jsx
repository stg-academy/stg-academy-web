import Card from './Card.jsx'

const formatDate = (dateString) => {
    if (!dateString) return '미정'
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })
}

// Extracted from the 100%-duplicated JSX in SessionInfoPage.jsx / CourseRecruitPage.jsx.
const CurriculumList = ({ lectures }) => {
    if (!lectures?.length) return null

    return (
        <section>
            <h2 className="text-base font-bold text-neutral-900 mb-3">커리큘럼</h2>
            <Card className="p-0">
                {lectures.map((lecture, index) => (
                    <div
                        key={lecture.id}
                        className={`flex items-center gap-4 px-5 py-3.5 text-sm ${
                            index < lectures.length - 1 ? 'border-b border-neutral-100' : ''
                        }`}
                    >
                        <span className="text-neutral-400 font-medium w-8 flex-shrink-0">
                            {lecture.sequence || index + 1}강
                        </span>
                        <span className="text-neutral-800 flex-1 truncate">
                            {lecture.title || `${index + 1}회차 강의`}
                        </span>
                        {lecture.lecture_date && (
                            <span className="text-neutral-400 flex-shrink-0">
                                {formatDate(lecture.lecture_date)}
                            </span>
                        )}
                    </div>
                ))}
            </Card>
        </section>
    )
}

export default CurriculumList
