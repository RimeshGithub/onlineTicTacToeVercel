"use client"

import type { GameState } from "@/types/game"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw, Trophy, Handshake, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface GameStatusProps {
  gameState: GameState
  playerSymbol: "X" | "O" | null
  onReset: () => void
  hasRequestedPlayAgain?: boolean
  otherPlayerRequestedPlayAgain?: boolean
}

export function GameStatus({
  gameState,
  playerSymbol,
  onReset,
  hasRequestedPlayAgain = false,
  otherPlayerRequestedPlayAgain = false,
}: GameStatusProps) {
  if (!gameState.isGameOver) return null

  const isWinner = gameState.winner === playerSymbol
  const isLoser = gameState.winner && gameState.winner !== playerSymbol

  const getPlayAgainButton = () => {
    if (hasRequestedPlayAgain) {
      return (
        <Button disabled variant="outline" className="mt-4 bg-transparent h-12 px-8 text-base font-semibold">
          <Clock className="h-4 w-4 mr-2" />
          Waiting for Other Player
        </Button>
      )
    }

    return (
      <Button onClick={onReset} variant="outline" className="mt-4 bg-transparent h-12 px-8 text-base font-semibold">
        <RotateCcw className="h-4 w-4 mr-2" />
        Play Again
      </Button>
    )
  }

  return (
    <Card
      className={cn("p-6 sm:p-8 mb-8 text-center backdrop-blur border-2 transition-all duration-300", {
        "bg-primary/5 border-primary/30 shadow-lg shadow-primary/10": isWinner,
        "bg-destructive/5 border-destructive/30 shadow-lg shadow-destructive/10": isLoser,
        "bg-muted/5 border-muted/30 shadow-lg": gameState.isDraw,
      })}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Icon */}
        <div
          className={cn("w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all", {
            "bg-primary/10 shadow-lg shadow-primary/20": isWinner,
            "bg-destructive/10 shadow-lg shadow-destructive/20": isLoser,
            "bg-muted/10 shadow-lg": gameState.isDraw,
          })}
        >
          {gameState.isDraw ? (
            <Handshake className={cn("h-10 w-10 sm:h-12 sm:w-12", "text-muted-foreground")} />
          ) : (
            <Trophy
              className={cn("h-10 w-10 sm:h-12 sm:w-12", {
                "text-primary": isWinner,
                "text-destructive": isLoser,
              })}
            />
          )}
        </div>

        {/* Message */}
        <div className="space-y-2">
          {gameState.isDraw ? (
            <>
              <h3 className="text-2xl sm:text-3xl font-bold text-muted-foreground">It's a Draw!</h3>
              <p className="text-base sm:text-lg text-muted-foreground">Great game! Both players played well.</p>
            </>
          ) : isWinner ? (
            <>
              <h3 className="text-2xl sm:text-3xl font-bold text-primary">You Won!</h3>
              <p className="text-base sm:text-lg text-muted-foreground">Congratulations on your victory!</p>
            </>
          ) : (
            <>
              <h3 className="text-2xl sm:text-3xl font-bold text-destructive">You Lost</h3>
              <p className="text-base sm:text-lg text-muted-foreground">Better luck next time!</p>
            </>
          )}
        </div>

        {/* Play Again Button */}
        {getPlayAgainButton()}
      </div>
    </Card>
  )
}
