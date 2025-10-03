export type GameMode = "online" | "custom"

export interface GameState {
  id: string
  board: string[]
  currentPlayer: "X" | "O"
  players: {
    X: string | null
    O: string | null
  }
  winner: string | null
  isDraw: boolean
  isGameOver: boolean
  createdAt: number
  lastMove: number
  mode: GameMode
  isPublic: boolean
  roomName?: string
  playerPresence: {
    X: {
      isOnline: boolean
      lastSeen: number
    }
    O: {
      isOnline: boolean
      lastSeen: number
    }
  }
  playAgainRequests: {
    X: boolean
    O: boolean
  }
  isTerminated: boolean
  terminationReason?: string
  quitter?: "X" | "O" | ""
}

export interface Player {
  id: string
  symbol: "X" | "O"
  name: string
}

export interface RoomInfo {
  id: string
  roomName: string
  createdBy: string
  playerCount: number
  maxPlayers: number
  createdAt: number
  isActive: boolean
  mode: GameMode
}
