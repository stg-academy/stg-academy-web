import { createContext, useCallback, useContext, useRef, useState } from 'react'
import Toast from './Toast.jsx'

const ToastContext = createContext(null)

const AUTO_DISMISS_MS = 4000
const MAX_STACKED = 3

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([])
    const nextId = useRef(0)

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const show = useCallback((tone, title, description) => {
        const id = nextId.current++
        setToasts((prev) => [{ id, tone, title, description }, ...prev].slice(0, MAX_STACKED))
        setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    }, [dismiss])

    const toast = {
        info: (title, description) => show('info', title, description),
        success: (title, description) => show('success', title, description),
        error: (title, description) => show('error', title, description),
        warning: (title, description) => show('warning', title, description),
    }

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
                {toasts.map((t) => (
                    <button key={t.id} onClick={() => dismiss(t.id)} className="text-left" aria-label="알림 닫기">
                        <Toast tone={t.tone} title={t.title} description={t.description} />
                    </button>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export const useToast = () => {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used within a ToastProvider')
    return ctx
}
