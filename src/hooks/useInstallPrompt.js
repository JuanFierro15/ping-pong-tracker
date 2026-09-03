import { useEffect, useState } from 'react'

export function useInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState(null)
  const [installed, setInstalled] = useState(
    () => window.matchMedia?.('(display-mode: standalone)').matches ?? false
  )

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault()
      setDeferredEvent(event)
    }

    function handleAppInstalled() {
      setInstalled(true)
      setDeferredEvent(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function promptInstall() {
    if (!deferredEvent) return
    deferredEvent.prompt()
    await deferredEvent.userChoice
    // El evento solo se puede usar una vez, se necesite otro para reintentar.
    setDeferredEvent(null)
  }

  return {
    canInstall: Boolean(deferredEvent) && !installed,
    promptInstall,
  }
}
