"use client"

import type { GameState } from "@/types/game"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { isWinningPosition } from "@/lib/game-logic"
import { cn } from "@/lib/utils"

interface GameBoardProps {
  gameState: GameState
  playerSymbol: "X" | "O" | null
  onMove: (position: number) => Promise<boolean>
}

export function GameBoard({ gameState, playerSymbol, onMove }: GameBoardProps) {
  const isPlayerTurn = gameState.currentPlayer === playerSymbol
  const canPlay = isPlayerTurn && !gameState.isGameOver

  const handleCellClick = async (position: number) => {
    if (!canPlay || gameState.board[position] !== null) return

    const success = await onMove(position)
    if (!success) {
      console.log("[v0] Move failed for position:", position)
    }
  }

  const getCellContent = (value: string | null) => {
    if (!value) return ""
    return value
  }

  const getCellStyle = (value: string | null, position: number) => {
    const isWinning = gameState.winner && isWinningPosition(position, gameState.board)
    const isEmpty = value === null
    const isClickable = isEmpty && canPlay

    return cn(
      "aspect-square flex items-center justify-center font-bold transition-all duration-300",
      "bg-card/50 backdrop-blur border border-border/50 rounded-2xl",
      "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
      "hover:bg-card/70 active:scale-95",
      {
        // Interaction states
        "cursor-pointer hover:scale-105 hover:shadow-lg": isClickable,
        "cursor-not-allowed": !canPlay,

        // Player colors
        "text-primary": value === "X",
        "text-accent": value === "O",

        // Winning highlights with enhanced styling
        "bg-primary/20 border-primary/50 shadow-xl shadow-primary/20 scale-105": isWinning && value === "X",
        "bg-accent/20 border-accent/50 shadow-xl shadow-accent/20 scale-105": isWinning && value === "O",

        // Game state styling
        "opacity-50": !canPlay && !gameState.isGameOver && !isEmpty,
        "animate-pulse border-primary/30": isClickable && isPlayerTurn,
      },
    )
  }

  return (
    <Card className="p-6 sm:p-8 bg-card/30 backdrop-blur border-border/50">
      {/* Game Board Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-md mx-auto mb-8">
        {gameState?.board?.map((cell, index) => (
          <Button
            key={index}
            variant="ghost"
            className={getCellStyle(cell, index)}
            onClick={() => handleCellClick(index)}
            disabled={!canPlay || cell !== null}
          >
            {getCellContent(cell)}
          </Button>
        ))}
      </div>

      {/* Game Status */}
      <div className="text-center">
        {gameState.isGameOver ? (
          <div className="space-y-3">
            {gameState.winner ? (
              <div>
                <p className="text-xl sm:text-2xl font-bold mb-2">
                  <span className={cn("font-bold", gameState.winner === "X" ? "text-primary" : "text-accent")}>
                    Player {gameState.winner}
                  </span>{" "}
                  wins!
                </p>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {gameState.winner === playerSymbol ? "🎉 Congratulations!" : "Better luck next time!"}
                </p>
              </div>
            ) : gameState.isDraw ? (
              <div>
                <p className="text-xl sm:text-2xl font-bold text-muted-foreground mb-2">It's a draw!</p>
                <p className="text-sm sm:text-base text-muted-foreground">Great game! Both players played well.</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-base sm:text-lg text-muted-foreground">
              Current turn:{" "}
              <span className={cn("font-bold", gameState.currentPlayer === "X" ? "text-primary" : "text-accent")}>
                Player {gameState.currentPlayer}
              </span>
            </p>
            {canPlay ? (
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                <p className="text-sm sm:text-base text-primary font-semibold">Your turn - make your move!</p>
              </div>
            ) : playerSymbol ? (
              <p className="text-sm sm:text-base text-muted-foreground">Waiting for opponent...</p>
            ) : (
              <p className="text-sm sm:text-base text-muted-foreground">Spectating game...</p>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
