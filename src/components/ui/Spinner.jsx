// STG Academy 디자인 시스템 — components/feedback/Spinner
// https://claude.ai/design/p/774c8016-97e7-4d52-8178-b1d08ba97734
const sizeMap = { sm: 16, md: 24, lg: 32 }

const Spinner = ({ size = 'md', tone = 'accent' }) => {
    const px = sizeMap[size] || sizeMap.md
    const color = tone === 'on-accent' ? 'var(--text-on-accent)' : 'var(--color-accent)'
    const track = tone === 'on-accent' ? 'rgba(255,255,255,0.35)' : 'var(--border-default)'

    return (
        <span style={{ display: 'inline-block', width: px, height: px }}>
            <style>{'@keyframes stg-spin{to{transform:rotate(360deg)}}'}</style>
            <svg width={px} height={px} viewBox="0 0 24 24" style={{ animation: 'stg-spin 0.7s linear infinite' }}>
                <circle cx="12" cy="12" r="9.5" fill="none" stroke={track} strokeWidth="3" />
                <path d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
            </svg>
        </span>
    )
}

export default Spinner
