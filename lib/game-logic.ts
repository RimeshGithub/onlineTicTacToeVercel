export type Player = "X" | "O"
export type Board = string[]

export interface WinResult {
  winner: Player | null
  winningLine: number[] | null
  isDraw: boolean
}

// All possible winning combinations
export const WINNING_LINES = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal top-left to bottom-right
  [2, 4, 6], // Diagonal top-right to bottom-left
]

/**
 * Check if there's a winner on the board
 */
export function checkWinner(board: Board): WinResult {
  // Check each winning line
  for (const line of WINNING_LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a] as Player,
        winningLine: line,
        isDraw: false,
      }
    }
  }

  const isDraw = board.every((cell) => cell !== "")

  return {
    winner: null,
    winningLine: null,
    isDraw,
  }
}

/**
 * Check if a position is part of the winning line
 */
export function isWinningPosition(position: number, board: Board): boolean {
  const result = checkWinner(board)
  return result.winningLine?.includes(position) ?? false
}

/**
 * Get all empty positions on the board
 */
export function getEmptyPositions(board: Board): number[] {
  return board.map((cell, index) => (cell === "" ? index : -1)).filter((index) => index !== -1)
}

/**
 * Check if a move is valid
 */
export function isValidMove(board: Board, position: number, currentPlayer: Player, playerSymbol: Player): boolean {
  // Check if position is within bounds
  if (position < 0 || position > 8) return false

  if (board[position] !== "") return false

  // Check if it's the player's turn
  if (currentPlayer !== playerSymbol) return false

  return true
}

/**
 * Make a move and return the new game state
 */
export function makeMove(board: Board, position: number, player: Player): Board {
  if (board[position] !== "") {
    throw new Error("Position already occupied")
  }

  const newBoard = [...board]
  newBoard[position] = player
  return newBoard
}

/**
 * Get the next player
 */
export function getNextPlayer(currentPlayer: Player): Player {
  return currentPlayer === "X" ? "O" : "X"
}

/**
 * Calculate game statistics
 */
export function getGameStats(board: Board) {
  const xCount = board.filter((cell) => cell === "X").length
  const oCount = board.filter((cell) => cell === "O").length
  const emptyCount = board.filter((cell) => cell === "").length

  return {
    xCount,
    oCount,
    emptyCount,
    totalMoves: xCount + oCount,
  }
}

/**
 * Simple AI for single player mode (optional enhancement)
 */
export function getAIMove(board: Board, difficulty: "easy" | "medium" | "hard" = "medium"): number {
  const emptyPositions = getEmptyPositions(board)

  if (emptyPositions.length === 0) {
    throw new Error("No empty positions available")
  }

  switch (difficulty) {
    case "easy":
      // Random move
      return emptyPositions[Math.floor(Math.random() * emptyPositions.length)]

    case "medium":
      // Try to win, then block, then random
      return getStrategicMove(board, "O") ?? getStrategicMove(board, "X") ?? getRandomMove(emptyPositions)

    case "hard":
      // Minimax algorithm (simplified)
      return getBestMove(board)

    default:
      return getRandomMove(emptyPositions)
  }
}

/**
 * Get a strategic move (win or block)
 */
function getStrategicMove(board: Board, player: Player): number | null {
  const emptyPositions = getEmptyPositions(board)

  for (const position of emptyPositions) {
    const testBoard = makeMove(board, position, player)
    const result = checkWinner(testBoard)
    if (result.winner === player) {
      return position
    }
  }

  return null
}

/**
 * Get a random move from available positions
 */
function getRandomMove(emptyPositions: number[]): number {
  return emptyPositions[Math.floor(Math.random() * emptyPositions.length)]
}

/**
 * Simplified minimax for best move (hard difficulty)
 */
function getBestMove(board: Board): number {
  const emptyPositions = getEmptyPositions(board)

  // Priority positions (center, corners, edges)
  const priorities = [4, 0, 2, 6, 8, 1, 3, 5, 7]

  for (const position of priorities) {
    if (emptyPositions.includes(position)) {
      return position
    }
  }

  return getRandomMove(emptyPositions)
}

/**
 * Validate game state consistency
 */
export function validateGameState(board: Board, currentPlayer: Player): boolean {
  const stats = getGameStats(board)

  // X always goes first, so X should have equal or one more move than O
  if (currentPlayer === "X") {
    return stats.xCount === stats.oCount
  } else {
    return stats.xCount === stats.oCount + 1
  }
}
