import { useState } from 'react'
import { useLiveMatch } from '../hooks/useLiveMatch'
import { getSetsToWin } from '../utils/gameLogic'
import MatchSetup from './MatchSetup'
import ScoreBoard from './ScoreBoard'
import MatchResult from './MatchResult'
import ConfirmDialog from './ConfirmDialog'

export default function MatchScreen() {
  const {
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
    hasStarted,
    addPoint,
    undoLastPoint,
    startMatch,
    resetMatch,
  } = useLiveMatch()

  // null | 'cancel-match' | 'undo-set'
  const [confirmAction, setConfirmAction] = useState(null)

  if (!hasStarted) {
    return (
      <MatchSetup
        player1Name={player1Name}
        player2Name={player2Name}
        onChangePlayer1Name={setPlayer1Name}
        onChangePlayer2Name={setPlayer2Name}
        matchFormat={matchFormat}
        onChangeMatchFormat={setMatchFormat}
        pointsToWin={pointsToWin}
        onChangePointsToWin={setPointsToWin}
        firstServer={firstServer}
        onChangeFirstServer={setFirstServer}
        onStart={startMatch}
      />
    )
  }

  if (matchWinner) {
    return (
      <MatchResult
        player1Name={player1Name}
        player2Name={player2Name}
        sets={sets}
        winner={matchWinner}
        onNewMatch={resetMatch}
      />
    )
  }

  const canUndo = sets.length > 0 || currentPoints.player1 > 0 || currentPoints.player2 > 0
  // Si el set actual está en 0-0 y ya hay sets jugados, el último punto anotado
  // fue justo el que cerró el set anterior: deshacerlo lo reabre.
  const undoWouldReopenSet =
    sets.length > 0 && currentPoints.player1 === 0 && currentPoints.player2 === 0

  function handleUndoRequest() {
    if (!canUndo) return
    if (undoWouldReopenSet) {
      setConfirmAction('undo-set')
    } else {
      undoLastPoint()
    }
  }

  return (
    <>
      <ScoreBoard
        player1Name={player1Name}
        player2Name={player2Name}
        currentPoints={currentPoints}
        sets={sets}
        setsToWin={getSetsToWin(matchFormat)}
        currentSetNumber={currentSetNumber}
        currentServer={currentServer}
        sidesSwapped={sidesSwapped}
        onScorePlayer1={() => addPoint('player1')}
        onScorePlayer2={() => addPoint('player2')}
        onUndo={handleUndoRequest}
        canUndo={canUndo}
        onRequestCancel={() => setConfirmAction('cancel-match')}
      />

      <ConfirmDialog
        open={confirmAction === 'cancel-match'}
        title="¿Cancelar partido?"
        message="Se perderá el progreso del partido en curso. Esta acción no se puede deshacer."
        confirmLabel="Sí, cancelar"
        cancelLabel="Seguir jugando"
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          setConfirmAction(null)
          resetMatch()
        }}
      />

      <ConfirmDialog
        open={confirmAction === 'undo-set'}
        title={`¿Reabrir el set ${sets.length}?`}
        message="El último punto cerró ese set. Deshacerlo lo vuelve a dejar en juego."
        confirmLabel="Sí, deshacer"
        cancelLabel="No, dejarlo"
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          setConfirmAction(null)
          undoLastPoint()
        }}
      />
    </>
  )
}
