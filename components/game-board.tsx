"use client"

import type { GameState } from "@/types/game"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { isWinningPosition } from "@/lib/game-logic"
import { cn } from "@/lib/utils"
import { X, Circle } from "lucide-react"

interface GameBoardProps {
  gameState: GameState
  playerSymbol: "X" | "O" | null
  onMove: (position: number) => Promise<boolean>
}

export function GameBoard({ gameState, playerSymbol, onMove }: GameBoardProps) {
  const isPlayerTurn = gameState.currentPlayer === playerSymbol
  const canPlay = isPlayerTurn && !gameState.isGameOver

  console.log("[v0] GameBoard render:", {
    currentPlayer: gameState.currentPlayer,
    playerSymbol,
    isPlayerTurn,
    canPlay,
    isGameOver: gameState.isGameOver,
    board: gameState.board,
  })

  const handleCellClick = async (position: number) => {
    console.log("[v0] Cell clicked:", {
      position,
      canPlay,
      cellValue: gameState.board[position],
      currentPlayer: gameState.currentPlayer,
      playerSymbol,
    })

    if (!canPlay) {
      console.log("[v0] Cannot play - not player's turn or game over")
      return
    }

    if (gameState.board[position] !== "") {
      console.log("[v0] Cell already occupied:", gameState.board[position])
      return
    }

    console.log("[v0] Attempting move...")
    const success = await onMove(position)
    console.log("[v0] Move result:", success)

    if (!success) {
      console.log("[v0] Move failed for position:", position)
    }
  }

  const getCellContent = (value: string) => {
    if (!value) return ""
    return value
  }

  const getCellStyle = (value: string, position: number) => {
    const isWinning = gameState.winner && isWinningPosition(position, gameState.board)
    const isEmpty = value === ""
    const isClickable = isEmpty && canPlay

    return cn(
      "aspect-square flex items-center justify-center font-bold transition-all duration-300",
      "bg-card/50 backdrop-blur border rounded-2xl",
      "h-20",
      {
        // Interaction states
        "cursor-pointer hover:scale-105 hover:shadow-lg": isClickable,

        "hover:bg-card/70 active:scale-95": !isWinning,

        // Winning highlights with enhanced styling
        "bg-primary/20 border-primary/50 shadow-xl shadow-primary/20 scale-105": isWinning,

        // Game state styling
        "opacity-70": !canPlay && !gameState.isGameOver && !isEmpty,
        "animate-pulse border-primary/50": isClickable && isPlayerTurn,
      },
    )
  }

  return (
    <Card className="p-6 sm:p-8 bg-card/30 backdrop-blur border-border/50 gap-1 -mt-5">
      {/* Game Board Grid */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 mx-auto mb-4">
        {gameState.board.map((cell, index) => (
          <button
            key={index}
            className={getCellStyle(cell, index)}
            onClick={() => {
              console.log("[v0] Button clicked for position:", index)
              handleCellClick(index)
            }}
            disabled={!canPlay || cell !== ""}
          >
            {cell === "X" ? <X className="!w-14 !h-14" /> : cell === "O" ? <Circle className="!w-14 !h-14" /> : ""}
          </button>
        ))}
      </div>

      {/* Game Status */}
      <div className="text-center">
        {gameState.isGameOver ? (
          <div className="space-y-3">
            {gameState.winner ? (
              <div className="flex flex-col items-center">
                <p className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
                  Player {gameState.winner === "X" ? <X className="w-10 h-10" /> : <Circle className="w-10 h-10" />}
                  wins!
                </p>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {gameState.winner === playerSymbol ? "🎉 Congratulations!" : "Better luck next time!"}
                </p>
              </div>
            ) : gameState.isDraw ? (
              <div>
                <p className="text-xl sm:text-2xl font-bold text-primary mb-2">It's a draw!</p>
                <p className="text-sm sm:text-base text-muted-foreground">Great game! Both players played well.</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-base sm:text-lg text-muted-foreground flex justify-center gap-2">
              Current turn:{" "}
              <span className={cn("font-bold", "text-primary", "flex items-center gap-1")}>
                Player {gameState.currentPlayer === "X" ? <X className="w-7 h-7" /> : <Circle className="w-5 h-5" />}
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
