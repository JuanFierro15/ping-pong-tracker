import { useEffect, useRef, useState } from 'react'
import { App as CapacitorApp } from '@capacitor/app'
import MatchScreen from './components/MatchScreen'
import HistoryScreen from './components/HistoryScreen'
import SplashScreen from './components/SplashScreen'
import { useInstallPrompt } from './hooks/useInstallPrompt'
import { PaddleIcon, HistoryIcon, XIcon } from './components/icons'

const TABS = [
  { id: 'match', label: 'Partido', Icon: PaddleIcon },
  { id: 'history', label: 'Historial', Icon: HistoryIcon },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('match')
  const { canInstall, promptInstall } = useInstallPrompt()
  const [installBannerDismissed, setInstallBannerDismissed] = useState(false)
  // Solo se muestra al montar la app (apertura), no al cambiar de pestaña:
  // las pestañas no remontan App, así que este estado no vuelve a activarse.
  const [showSplash, setShowSplash] = useState(true)
  const historyScreenRef = useRef(null)

  // Boton/gesto de retroceso nativo de Android: primero le da la oportunidad
  // a la pantalla de Historial de cerrar su propio detalle (si hay uno
  // abierto); si no hizo nada, se interpreta como "volver" entre pestañas;
  // y desde la pestaña principal se deja salir la app en vez de interceptar.
  useEffect(() => {
    const listenerPromise = CapacitorApp.addListener('backButton', () => {
      if (activeTab === 'history') {
        const handled = historyScreenRef.current?.goBack()
        if (handled) return
        setActiveTab('match')
        return
      }
      CapacitorApp.exitApp()
    })

    return () => {
      listenerPromise.then((listener) => listener.remove())
    }
  }, [activeTab])

  return (
    <div className="flex h-dvh flex-col bg-bg pt-[var(--safe-area-inset-top,env(safe-area-inset-top))]">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {canInstall && !installBannerDismissed && (
        <div className="flex items-center justify-between gap-2 bg-accent-dark px-4 py-2 text-sm text-white">
          <span>Instala la app para usarla sin conexión</span>
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
              className="p-1 text-white/80"
            >
              <XIcon className="h-4 w-4" />
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
        <div className={`h-full ${activeTab === 'history' ? 'theme-history bg-bg text-gray-900' : 'hidden'}`}>
          <HistoryScreen ref={historyScreenRef} active={activeTab === 'history'} />
        </div>
      </main>

      <nav
        className={`relative flex border-t pb-[var(--safe-area-inset-bottom,env(safe-area-inset-bottom))] transition-colors ${
          activeTab === 'history' ? 'theme-history border-black/10 bg-surface' : 'border-white/10 bg-surface'
        }`}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-semibold transition ${
              activeTab === tab.id ? 'text-accent' : 'text-gray-500'
            }`}
          >
            <tab.Icon className="h-5 w-5" />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
