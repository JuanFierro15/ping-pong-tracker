import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  computeMatchState,
  getCurrentServer,
  getAutoSidesSwapped,
  DEFAULT_MATCH_FORMAT,
  DEFAULT_POINTS_TO_WIN,
  DEFAULT_FIRST_SERVER,
} from '../utils/gameLogic'
import { saveMatch } from '../db'
import { vibrateMatchWon, vibratePoint, vibrateSetWon } from '../utils/haptics'

export function useLiveMatch() {
  const [player1Name, setPlayer1Name] = useState('Jugador 1')
  const [player2Name, setPlayer2Name] = useState('Jugador 2')
  const [matchFormat, setMatchFormat] = useState(DEFAULT_MATCH_FORMAT)
  const [pointsToWin, setPointsToWin] = useState(DEFAULT_POINTS_TO_WIN)
  const [firstServer, setFirstServer] = useState(DEFAULT_FIRST_SERVER)
  const [events, setEvents] = useState([])
  const [saved, setSaved] = useState(false)
  const [started, setStarted] = useState(false)

  const matchRules = useMemo(() => ({ matchFormat, pointsToWin }), [matchFormat, pointsToWin])

  const { sets, currentPoints, currentSetNumber, matchWinner } = useMemo(
    () => computeMatchState(events, matchRules),
    [events, matchRules]
  )

  // Derivado del marcador actual, nunca guardado aparte: ver getCurrentServer.
  const currentServer = useMemo(
    () => getCurrentServer(currentPoints, firstServer, pointsToWin),
    [currentPoints, firstServer, pointsToWin]
  )

  // Igual de derivado que el saque: ver getAutoSidesSwapped.
  const sidesSwapped = useMemo(
    () => getAutoSidesSwapped(currentSetNumber, currentPoints, matchFormat, pointsToWin),
    [currentSetNumber, currentPoints, matchFormat, pointsToWin]
  )

  const addPoint = useCallback(
    (player) => {
      if (matchWinner) return
      const newEvents = [...events, player]
      const newState = computeMatchState(newEvents, matchRules)

      if (newState.matchWinner) {
        vibrateMatchWon()
      } else if (newState.sets.length > sets.length) {
        vibrateSetWon()
      } else {
        vibratePoint()
      }

      setEvents(newEvents)
    },
    [events, matchWinner, sets.length, matchRules]
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
      }
      setSaved(true)
      saveMatch(match)
    }
  }, [matchWinner, saved, sets, player1Name, player2Name, matchFormat, pointsToWin])

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
    matchWinner,
    hasStarted: started,
    addPoint,
    undoLastPoint,
    startMatch,
    resetMatch,
  }
}
