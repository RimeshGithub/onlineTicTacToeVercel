"use client"

import type { GameState } from "@/types/game"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Crown, User, X, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface GameHeaderProps {
  gameState: GameState
  playerSymbol: "X" | "O" | null
  playerName: string
}

export function GameHeader({ gameState, playerSymbol, playerName }: GameHeaderProps) {
  const opponentSymbol = playerSymbol === "X" ? "O" : "X"
  const opponentName = gameState.players[opponentSymbol]

  return (
    <Card className="p-4 sm:p-6 mb-8 bg-card/50 backdrop-blur border-border/50">
      <div className="flex items-center justify-between">
        {/* Player X */}
        <div className="flex items-center gap-3 sm:gap-4 flex-row">
          <div
            className={cn(
              "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-xl sm:text-2xl",
              "bg-primary/10 text-primary border-2 transition-all duration-300",
              gameState.currentPlayer === "X" ? "border-primary shadow-lg shadow-primary/20" : "border-primary/30",
            )}
          >
            <X />
          </div>
          <div className="text-right min-w-0">
            <div className="flex items-center gap-2 mb-1 justify-end">
              <p className="font-semibold text-sm sm:text-base truncate max-w-24 sm:max-w-none">
                {gameState.players.X || (
                  <span className="text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="hidden sm:inline">Waiting...</span>
                  </span>
                )}
              </p>
              {playerSymbol === "X" && gameState.players.X && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  You
                </Badge>
              )}
            </div>
            {gameState.winner === "X" && (
              <div className="flex items-center gap-1 text-xs text-primary justify-end">
                <Crown className="h-3 w-3" />
                Winner
              </div>
            )}
          </div>
        </div>

        {/* VS Section */}
        <div className="text-center px-2 sm:px-4">
          <div className="text-xs sm:text-sm text-muted-foreground mb-1 font-medium">VS</div>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span className="hidden sm:inline">{opponentName ? "Live" : "Waiting"}</span>
          </div>
        </div>

        {/* Player O */}
        <div className="flex items-center gap-3 sm:gap-4 flex-row-reverse">
          <div
            className={cn(
              "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-xl sm:text-2xl",
              "bg-primary/10 text-primary border-2 transition-all duration-300",
              gameState.currentPlayer === "O" ? "border-primary shadow-lg shadow-primary/20" : "border-primary/30",
            )}
          >
            <Circle />
          </div>
          <div className="text-right min-w-0">
            <div className="flex items-center gap-2 mb-1 justify-end">
              {playerSymbol === "O" && gameState.players.O && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  You
                </Badge>
              )}
              <p className="font-semibold text-sm sm:text-base truncate max-w-24 sm:max-w-none">
                {gameState.players.O || (
                  <span className="text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="hidden sm:inline">Waiting...</span>
                  </span>
                )}
              </p>
            </div>
            {gameState.winner === "O" && (
              <div className="flex items-center gap-1 text-xs text-primary justify-end">
                <Crown className="h-3 w-3" />
                Winner
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
