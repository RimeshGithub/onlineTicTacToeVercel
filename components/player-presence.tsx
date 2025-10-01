"use client"

import { Badge } from "@/components/ui/badge"
import { User, UserCheck, UserX, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { GameState } from "@/types/game"

interface PlayerPresenceProps {
  gameState: GameState
  playerSymbol: "X" | "O" | null
  className?: string
}

export function PlayerPresence({ gameState, playerSymbol, className }: PlayerPresenceProps) {
  if (!gameState.players.O || !playerSymbol) return null

  const otherPlayerSymbol = playerSymbol === "X" ? "O" : "X"
  const otherPlayerName = gameState.players[otherPlayerSymbol]
  const otherPlayerPresence = gameState.playerPresence[otherPlayerSymbol]

  const getPresenceStatus = () => {
    if (!otherPlayerPresence) {
      return {
        icon: User,
        text: "Unknown",
        variant: "secondary" as const,
        className: "bg-muted/10 text-muted-foreground border-muted/20",
      }
    }

    const now = Date.now()
    const timeSinceLastSeen = now - otherPlayerPresence.lastSeen
    const isRecentlyActive = timeSinceLastSeen < 15000 // 15 seconds

    if (otherPlayerPresence.isOnline && isRecentlyActive) {
      return {
        icon: UserCheck,
        text: "Online",
        variant: "default" as const,
        className: "bg-green-500/10 text-green-600 border-green-500/20",
      }
    } else if (timeSinceLastSeen < 60000) {
      // Less than 1 minute ago
      return {
        icon: Clock,
        text: "Away",
        variant: "secondary" as const,
        className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      }
    } else {
      return {
        icon: UserX,
        text: "Offline",
        variant: "destructive" as const,
        className: "bg-red-500/10 text-red-600 border-red-500/20",
      }
    }
  }

  const status = getPresenceStatus()
  const Icon = status.icon

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="text-sm text-muted-foreground">{otherPlayerName}:</span>
      <Badge variant={status.variant} className={cn("flex items-center gap-1.5 text-xs px-2 py-1", status.className)}>
        <Icon className="h-3 w-3" />
        <span>{status.text}</span>
      </Badge>
    </div>
  )
}
