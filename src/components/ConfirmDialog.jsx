export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  theme = 'dark',
}) {
  if (!open) return null

  const titleColor = theme === 'light' ? 'text-gray-900' : 'text-gray-100'
  const messageColor = theme === 'light' ? 'text-gray-500' : 'text-gray-400'
  const cancelColor = theme === 'light' ? 'text-gray-700' : 'text-gray-200'
  const borderColor = theme === 'light' ? 'border-black/10' : 'border-white/10'

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 ${theme === 'light' ? 'theme-history' : ''}`}>
      <div className={`w-full max-w-sm rounded-2xl border ${borderColor} bg-surface p-5 shadow-xl`}>
        <h2 className={`text-lg font-bold ${titleColor}`}>{title}</h2>
        {message && <p className={`mt-2 text-sm ${messageColor}`}>{message}</p>}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={`flex-1 rounded-xl bg-surface-2 py-3 text-base font-semibold active:scale-95 transition ${cancelColor}`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 py-3 text-base font-semibold text-white active:scale-95 transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
