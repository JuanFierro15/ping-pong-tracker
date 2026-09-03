import { useState } from 'react'
import MatchScreen from './components/MatchScreen'
import HistoryScreen from './components/HistoryScreen'
import { useInstallPrompt } from './hooks/useInstallPrompt'

const TABS = [
  { id: 'match', label: 'Partido', icon: '🏓' },
  { id: 'history', label: 'Historial', icon: '📋' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('match')
  const { canInstall, promptInstall } = useInstallPrompt()
  const [installBannerDismissed, setInstallBannerDismissed] = useState(false)

  return (
    <div className="flex h-dvh flex-col bg-bg">
      {canInstall && !installBannerDismissed && (
        <div className="flex items-center justify-between gap-2 bg-emerald-700 px-4 py-2 text-sm text-white">
          <span>📲 Instala la app para usarla sin conexión</span>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={promptInstall}
              className="rounded-lg bg-white/20 px-3 py-1 font-semibold active:bg-white/30"
            >
              Instalar
            </button>
            <button
              type="button"
              onClick={() => setInstallBannerDismissed(true)}
              aria-label="Cerrar aviso de instalación"
              className="px-1 font-semibold text-white/80"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="min-h-0 flex-1">
        {/* Ambas pantallas permanecen montadas para no perder el partido en
            curso si el usuario cambia de pestaña por accidente. */}
        <div className={`h-full ${activeTab === 'match' ? '' : 'hidden'}`}>
          <MatchScreen />
        </div>
        <div className={`h-full ${activeTab === 'history' ? '' : 'hidden'}`}>
          <HistoryScreen active={activeTab === 'history'} />
        </div>
      </main>

      <nav className="flex border-t border-white/10 bg-surface pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition ${
              activeTab === tab.id ? 'text-emerald-500' : 'text-gray-500'
            }`}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
