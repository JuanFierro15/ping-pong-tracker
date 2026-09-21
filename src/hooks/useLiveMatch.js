import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  computeMatchState,
  getCurrentServer,
  getAutoSidesSwapped,
  getSetFirstServer,
  DEFAULT_MATCH_FORMAT,
  DEFAULT_POINTS_TO_WIN,
  DEFAULT_FIRST_SERVER,
} from '../utils/gameLogic'
import { saveMatch } from '../db'
import { vibrateMatchWon, vibratePoint, vibrateSetWon } from '../utils/haptics'
import { playTimeoutEnd, playTimeoutStart } from '../utils/sounds'

export function useLiveMatch() {
  const [player1Name, setPlayer1Name] = useState('Jugador 1')
  const [player2Name, setPlayer2Name] = useState('Jugador 2')
  const [matchFormat, setMatchFormat] = useState(DEFAULT_MATCH_FORMAT)
  const [pointsToWin, setPointsToWin] = useState(DEFAULT_POINTS_TO_WIN)
  const [firstServer, setFirstServer] = useState(DEFAULT_FIRST_SERVER)
  const [manualSwap, setManualSwap] = useState(false)
  const [events, setEvents] = useState([])
  const [saved, setSaved] = useState(false)
  const [started, setStarted] = useState(false)

  // Cronometro: arranca con el primer punto anotado, no al abrir la
  // pantalla de Setup. matchStartedAt/setStartedAt se fijan de forma
  // imperativa en addPoint (no via efecto) para capturar el instante real
  // en que se anoto el punto, no el del siguiente render.
  const [matchStartedAt, setMatchStartedAt] = useState(null)
  const [setStartedAt, setSetStartedAt] = useState(null)
  const [now, setNow] = useState(Date.now())

  // Time-out: una vez por jugador por partido, 1 minuto reglamentario.
  // pausedMs/pausedSetMs acumulan cuanto tiempo total pasaron los
  // cronometros "congelados" por time-outs ya terminados, para restarlo
  // del tiempo transcurrido (pausedSetMs se reinicia en cada set nuevo).
  const [timeoutsUsed, setTimeoutsUsed] = useState({ player1: false, player2: false })
  const [timeoutPlayer, setTimeoutPlayer] = useState(null)
  const [timeoutStartedAt, setTimeoutStartedAt] = useState(null)
  const [pausedMs, setPausedMs] = useState(0)
  const [pausedSetMs, setPausedSetMs] = useState(0)
  const timeoutTimerRef = useRef(null)

  const matchRules = useMemo(() => ({ matchFormat, pointsToWin }), [matchFormat, pointsToWin])

  const { sets, currentPoints, currentSetNumber, matchWinner } = useMemo(
    () => computeMatchState(events, matchRules),
    [events, matchRules]
  )

  // Derivado del marcador actual, nunca guardado aparte: ver getCurrentServer.
  // firstServer (elegido en Setup) es quien saca en el set 1; el que saca
  // primero en CADA set se alterna segun getSetFirstServer (regla ITTF
  // 2.13.6: quien recibio primero en un set saca primero en el siguiente).
  const currentServer = useMemo(
    () => getCurrentServer(currentPoints, getSetFirstServer(firstServer, currentSetNumber), pointsToWin),
    [currentPoints, firstServer, currentSetNumber, pointsToWin]
  )

  // Igual de derivado que el saque (ver getAutoSidesSwapped), combinado con
  // el toggle manual: si el jugador lo activa, invierte lo que diria la
  // regla automatica en vez de reemplazarla, asi el aviso automatico de
  // "cambio de lado" sigue disparandose en el momento que corresponde
  // aunque el usuario ya lo haya adelantado a mano.
  const autoSwapped = useMemo(
    () => getAutoSidesSwapped(currentSetNumber, currentPoints, matchFormat, pointsToWin),
    [currentSetNumber, currentPoints, matchFormat, pointsToWin]
  )
  const sidesSwapped = autoSwapped !== manualSwap

  const toggleSides = useCallback(() => {
    setManualSwap((prev) => !prev)
  }, [])

  // Un tick por segundo mientras el partido esta en marcha, para que los
  // cronometros de partido/set se vean correr. Se detiene solo (no hay
  // timer de fondo) en cuanto termina el partido o todavia no arranco.
  useEffect(() => {
    if (!matchStartedAt || matchWinner) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [matchStartedAt, matchWinner])

  // Mientras hay un time-out activo, se usa timeoutStartedAt (fijo) en vez
  // de "now" (que sigue avanzando) como ancla: el cronometro queda
  // congelado en pantalla sin necesitar un efecto aparte que lo pause.
  const matchElapsedMs = matchStartedAt ? (timeoutStartedAt ?? now) - matchStartedAt - pausedMs : 0
  const setElapsedMs = setStartedAt ? (timeoutStartedAt ?? now) - setStartedAt - pausedSetMs : 0
  const timeoutRemainingSeconds = timeoutStartedAt
    ? Math.max(0, 60 - Math.floor((now - timeoutStartedAt) / 1000))
    : 0

  const startTimeout = useCallback(
    (player) => {
      if (timeoutStartedAt || timeoutsUsed[player] || matchWinner) return
      setTimeoutPlayer(player)
      setTimeoutStartedAt(Date.now())
      setTimeoutsUsed((prev) => ({ ...prev, [player]: true }))
      playTimeoutStart()
    },
    [timeoutStartedAt, timeoutsUsed, matchWinner]
  )

  // Termina el time-out ya sea porque se cumplieron los 60s o porque el
  // jugador lo corta antes con "Reanudar" (bloqueaba toda la pantalla sin
  // forma de seguir jugando si nadie queria esperar el minuto completo).
  // En ambos casos se descuenta el tramo realmente transcurrido de ambos
  // cronometros (partido y set), no siempre 60s fijos.
  const endTimeoutNow = useCallback(() => {
    if (!timeoutStartedAt) return
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
    }
    const pausedFor = Date.now() - timeoutStartedAt
    setPausedMs((prev) => prev + pausedFor)
    setPausedSetMs((prev) => prev + pausedFor)
    setTimeoutStartedAt(null)
    setTimeoutPlayer(null)
    playTimeoutEnd()
  }, [timeoutStartedAt])

  useEffect(() => {
    if (!timeoutStartedAt) return
    timeoutTimerRef.current = setTimeout(endTimeoutNow, 60000)
    return () => {
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current)
        timeoutTimerRef.current = null
      }
    }
  }, [timeoutStartedAt, endTimeoutNow])

  const addPoint = useCallback(
    (player) => {
      // No se puede anotar mientras hay un time-out en curso.
      if (matchWinner || timeoutStartedAt) return
      const pointTime = Date.now()

      // currentPoints en 0-0 significa que este punto es el primero de su
      // set (incluido el primer punto de todo el partido, que tambien es
      // el primero del set 1), asi que es el instante correcto para
      // arrancar/reiniciar el cronometro del set (y su acumulado de
      // time-outs pausados, que es por set).
      if (currentPoints.player1 === 0 && currentPoints.player2 === 0) {
        setSetStartedAt(pointTime)
        setPausedSetMs(0)
      }
      if (!matchStartedAt) {
        setMatchStartedAt(pointTime)
      }

      const newEvents = [...events, player]
      const newState = computeMatchState(newEvents, matchRules)

      if (newState.matchWinner) {
        // Fija "now" en el instante exacto del punto ganador: sin esto, la
        // duracion guardada del partido podria quedar hasta un segundo
        // desfasada (el ultimo tick del intervalo no llega a tiempo).
        setNow(pointTime)
        vibrateMatchWon()
      } else if (newState.sets.length > sets.length) {
        vibrateSetWon()
      } else {
        vibratePoint()
      }

      setEvents(newEvents)
    },
    [events, matchWinner, sets.length, matchRules, currentPoints, matchStartedAt, timeoutStartedAt]
  )

  const undoLastPoint = useCallback(() => {
    setEvents((prev) => prev.slice(0, -1))
  }, [])

  const startMatch = useCallback(() => {
    // Mismo fallback que MatchDetail al editar nombres: sin esto, un
    // campo vaciado guardaba '' y dejaba el marcador y el historial con
    // nombres en blanco.
    setPlayer1Name((prev) => prev.trim() || 'Jugador 1')
    setPlayer2Name((prev) => prev.trim() || 'Jugador 2')
    setStarted(true)
  }, [])

  const resetMatch = useCallback(() => {
    setEvents([])
    setSaved(false)
    setStarted(false)
    setManualSwap(false)
    setMatchStartedAt(null)
    setSetStartedAt(null)
    setTimeoutsUsed({ player1: false, player2: false })
    setTimeoutPlayer(null)
    setTimeoutStartedAt(null)
    setPausedMs(0)
    setPausedSetMs(0)
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (matchWinner && !saved) {
      const match = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        player1Name,
        player2Name,
        sets,
        winner: matchWinner,
        matchFormat,
        pointsToWin,
        durationMs: matchElapsedMs,
      }
      setSaved(true)
      saveMatch(match)
    }
  }, [matchWinner, saved, sets, player1Name, player2Name, matchFormat, pointsToWin, matchElapsedMs])

  return {
    player1Name,
    setPlayer1Name,
    player2Name,
    setPlayer2Name,
    matchFormat,
    setMatchFormat,
    pointsToWin,
    setPointsToWin,
    firstServer,
    setFirstServer,
    sets,
    currentPoints,
    currentSetNumber,
    currentServer,
    sidesSwapped,
    autoSwapped,
    toggleSides,
    matchElapsedMs,
    setElapsedMs,
    timeoutsUsed,
    timeoutPlayer,
    timeoutRemainingSeconds,
    startTimeout,
    endTimeout: endTimeoutNow,
    matchWinner,
    hasStarted: started,
    addPoint,
    undoLastPoint,
    startMatch,
    resetMatch,
  }
}
