export interface GameState {
  id: string
  board: (string | null)[]
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
}

export interface Player {
  id: string
  symbol: "X" | "O"
  name: string
}
