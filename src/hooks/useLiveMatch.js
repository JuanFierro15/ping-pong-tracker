import { useCallback, useEffect, useMemo, useState } from 'react'
import { computeMatchState } from '../utils/gameLogic'
import { saveMatch } from '../db'
import { vibrateMatchWon, vibratePoint, vibrateSetWon } from '../utils/haptics'

export function useLiveMatch() {
  const [player1Name, setPlayer1Name] = useState('Jugador 1')
  const [player2Name, setPlayer2Name] = useState('Jugador 2')
  const [events, setEvents] = useState([])
  const [saved, setSaved] = useState(false)
  const [started, setStarted] = useState(false)

  const { sets, currentPoints, currentSetNumber, matchWinner } = useMemo(
    () => computeMatchState(events),
    [events]
  )

  const addPoint = useCallback(
    (player) => {
      if (matchWinner) return
      const newEvents = [...events, player]
      const newState = computeMatchState(newEvents)

      if (newState.matchWinner) {
        vibrateMatchWon()
      } else if (newState.sets.length > sets.length) {
        vibrateSetWon()
      } else {
        vibratePoint()
      }

      setEvents(newEvents)
    },
    [events, matchWinner, sets.length]
  )

  const undoLastPoint = useCallback(() => {
    setEvents((prev) => prev.slice(0, -1))
  }, [])

  const startMatch = useCallback(() => {
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
      }
      setSaved(true)
      saveMatch(match)
    }
  }, [matchWinner, saved, sets, player1Name, player2Name])

  return {
    player1Name,
    setPlayer1Name,
    player2Name,
    setPlayer2Name,
    sets,
    currentPoints,
    currentSetNumber,
    matchWinner,
    hasStarted: started,
    addPoint,
    undoLastPoint,
    startMatch,
    resetMatch,
  }
}
