import Modal from './Modal.jsx'
import Button from './Button.jsx'

// Replaces native confirm() — gates a yes/no decision, unlike Toast which is
// fire-and-forget. Built on the existing side-panel Modal.
const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = '확인',
    message,
    confirmText = '확인',
    cancelText = '취소',
    danger = false,
}) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        width="md:w-[420px]"
        footer={
            <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={onClose}>
                    {cancelText}
                </Button>
                <Button
                    variant={danger ? 'danger' : 'primary'}
                    className="flex-1"
                    onClick={() => {
                        onConfirm()
                        onClose()
                    }}
                >
                    {confirmText}
                </Button>
            </div>
        }
    >
        <p className="text-sm text-neutral-700 whitespace-pre-line">{message}</p>
    </Modal>
)

export default ConfirmModal
