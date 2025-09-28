"use client"

import { useState, useEffect, useCallback } from "react"
import { ref, onValue, set, off } from "firebase/database"
import { database } from "@/lib/firebase"
import { checkWinner, isValidMove, makeMove as makeMoveLogic, getNextPlayer } from "@/lib/game-logic"
import type { GameState } from "@/types/game"

export function useGame(gameId: string, playerName: string, isCreator = false) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerSymbol, setPlayerSymbol] = useState<"X" | "O" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("connecting")

  // Initialize game
  const initializeGame = useCallback(async () => {
    if (!gameId || !playerName) return

    const gameRef = ref(database, `games/${gameId}`)

    try {
      if (isCreator) {
        // Create new game
        const newGame: GameState = {
          id: gameId,
          board: Array(9).fill(null),
          currentPlayer: "X",
          players: {
            X: playerName,
            O: null,
          },
          winner: null,
          isDraw: false,
          isGameOver: false,
          createdAt: Date.now(),
          lastMove: Date.now(),
        }

        await set(gameRef, newGame)
        setPlayerSymbol("X")
        setConnectionStatus("connected")
      } else {
        // Join existing game
        const unsubscribe = onValue(
          gameRef,
          (snapshot) => {
            const game = snapshot.val()
            if (game) {
              if (!game.players.O) {
                // Join as player O
                const updatedGame = {
                  ...game,
                  players: {
                    ...game.players,
                    O: playerName,
                  },
                }
                set(gameRef, updatedGame)
                setPlayerSymbol("O")
                setConnectionStatus("connected")
              } else if (game.players.X === playerName) {
                setPlayerSymbol("X")
                setConnectionStatus("connected")
              } else if (game.players.O === playerName) {
                setPlayerSymbol("O")
                setConnectionStatus("connected")
              } else {
                setError("Game is full")
                setConnectionStatus("disconnected")
                return
              }
            } else {
              setError("Game not found")
              setConnectionStatus("disconnected")
            }
          },
          { onlyOnce: true },
        )
      }
    } catch (err) {
      setError("Failed to initialize game")
      setConnectionStatus("disconnected")
      console.error("Game initialization error:", err)
    }
  }, [gameId, playerName, isCreator])

  // Listen to game state changes with real-time synchronization
  useEffect(() => {
    if (!gameId) return

    const gameRef = ref(database, `games/${gameId}`)

    const unsubscribe = onValue(
      gameRef,
      (snapshot) => {
        const game = snapshot.val()
        if (game) {
          setGameState(game)
          setError(null)
          setConnectionStatus("connected")

          if (gameState && game.lastMove > gameState.lastMove) {
            console.log("[v0] Real-time move detected and validated:", game.lastMove)
          }
        } else if (!isCreator) {
          setError("Game not found")
          setConnectionStatus("disconnected")
        }
        setIsLoading(false)
      },
      (error) => {
        console.error("Firebase connection error:", error)
        setConnectionStatus("disconnected")
        setError("Connection lost")
      },
    )

    const connectedRef = ref(database, ".info/connected")
    const connectionUnsubscribe = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        setConnectionStatus("connected")
        if (error === "Connection lost") {
          setError(null)
        }
      } else {
        setConnectionStatus("disconnected")
      }
    })

    return () => {
      off(gameRef, "value", unsubscribe)
      off(connectedRef, "value", connectionUnsubscribe)
    }
  }, [gameId, isCreator, error, gameState])

  // Initialize game on mount
  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  const makeMove = useCallback(
    async (position: number) => {
      if (!gameState || !playerSymbol) return false

      // Validate move using game logic
      if (!isValidMove(gameState.board, position, gameState.currentPlayer, playerSymbol)) {
        console.log("[v0] Invalid move attempted:", { position, currentPlayer: gameState.currentPlayer, playerSymbol })
        return false
      }

      if (gameState.isGameOver) {
        console.log("[v0] Move attempted on finished game")
        return false
      }

      const gameRef = ref(database, `games/${gameId}`)

      try {
        // Make the move using game logic
        const newBoard = makeMoveLogic(gameState.board, position, playerSymbol)

        // Check game result using enhanced logic
        const gameResult = checkWinner(newBoard)

        const updatedGame: GameState = {
          ...gameState,
          board: newBoard,
          currentPlayer: getNextPlayer(playerSymbol),
          winner: gameResult.winner,
          isDraw: gameResult.isDraw,
          isGameOver: gameResult.winner !== null || gameResult.isDraw,
          lastMove: Date.now(),
        }

        // Optimistic update
        setGameState(updatedGame)

        // Sync to Firebase
        await set(gameRef, updatedGame)
        console.log("[v0] Move synchronized successfully with game logic validation")
        return true
      } catch (err) {
        console.error("Move synchronization error:", err)
        // Revert optimistic update
        setGameState(gameState)
        setError("Failed to sync move")
        return false
      }
    },
    [gameState, playerSymbol, gameId],
  )

  const resetGame = useCallback(async () => {
    if (!gameState) return

    const gameRef = ref(database, `games/${gameId}`)
    const resetGame: GameState = {
      ...gameState,
      board: Array(9).fill(null),
      currentPlayer: "X", // Always start with X
      winner: null,
      isDraw: false,
      isGameOver: false,
      lastMove: Date.now(),
    }

    try {
      await set(gameRef, resetGame)
      console.log("[v0] Game reset synchronized with proper initial state")
    } catch (err) {
      console.error("Reset synchronization error:", err)
      setError("Failed to reset game")
    }
  }, [gameState, gameId])

  return {
    gameState,
    playerSymbol,
    isLoading,
    error,
    connectionStatus,
    makeMove,
    resetGame,
  }
}
