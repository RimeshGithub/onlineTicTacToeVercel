"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ref, onValue, set, onDisconnect } from "firebase/database"
import { database } from "@/lib/firebase"
import { checkWinner, isValidMove, makeMove as makeMoveLogic, getNextPlayer } from "@/lib/game-logic"
import type { GameState, GameMode } from "@/types/game"

export function useGame(gameId: string, playerName: string, isCreator = false, mode: GameMode = "custom") {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerSymbol, setPlayerSymbol] = useState<"X" | "O" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("connecting")

  const presenceIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const disconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const leaveGame = useCallback(async () => {
    if (!gameState || !playerSymbol) return

    const gameRef = ref(database, `games/${gameId}`)

    try {
      const updatedGame: GameState = {
        ...gameState,
        players: {
          ...gameState.players,
          [playerSymbol]: null,
        },
        playerPresence: {
          ...gameState.playerPresence,
          [playerSymbol]: {
            isOnline: false,
            lastSeen: Date.now(),
          },
        },
        isTerminated: true,
        terminationReason: `${gameState.players[playerSymbol]} left the game`,
        lastMove: Date.now(),
      }

      await set(gameRef, updatedGame)

      // Clear presence monitoring
      if (presenceIntervalRef.current) {
        clearInterval(presenceIntervalRef.current)
      }
    } catch (err) {
      console.error("Failed to leave game:", err)
      setError("Failed to leave game")
    }
  }, [gameState, playerSymbol, gameId])

  const checkForDisconnectedPlayers = useCallback(async () => {
    if (!gameState || gameState.isTerminated) return

    const now = Date.now()
    const disconnectThreshold = 30000 // 30 seconds

    const playerXDisconnected =
      gameState.players.X &&
      !gameState.playerPresence.X.isOnline &&
      now - gameState.playerPresence.X.lastSeen > disconnectThreshold

    const playerODisconnected =
      gameState.players.O &&
      !gameState.playerPresence.O.isOnline &&
      now - gameState.playerPresence.O.lastSeen > disconnectThreshold

    if (playerXDisconnected || playerODisconnected) {
      const disconnectedPlayer = playerXDisconnected ? gameState.players.X : gameState.players.O

      const gameRef = ref(database, `games/${gameId}`)
      const updatedGame: GameState = {
        ...gameState,
        isTerminated: true,
        terminationReason: `${disconnectedPlayer} disconnected`,
        lastMove: Date.now(),
      }

      try {
        await set(gameRef, updatedGame)
      } catch (err) {
        console.error("Failed to terminate game:", err)
      }
    }
  }, [gameState, gameId])

  const updatePresence = useCallback(async () => {
    if (!gameState || !playerSymbol || gameState.isTerminated) return

    const gameRef = ref(database, `games/${gameId}`)
    const updatedGame: GameState = {
      ...gameState,
      playerPresence: {
        ...gameState.playerPresence,
        [playerSymbol]: {
          isOnline: true,
          lastSeen: Date.now(),
        },
      },
    }

    try {
      await set(gameRef, updatedGame)
    } catch (err) {
      console.error("Failed to update presence:", err)
    }
  }, [gameState, playerSymbol, gameId])

  // Initialize game
  const initializeGame = useCallback(async () => {
    if (!gameId || !playerName) return

    const gameRef = ref(database, `games/${gameId}`)

    try {
      const randomTurn = Math.random() < 0.5 ? "X" : "O"
      if (isCreator) {
        const newGame: GameState = {
          id: gameId,
          board: Array(9).fill(""),
          currentPlayer: Math.random() < 0.5 ? "X" : "O",
          players: {
            X: randomTurn === "X" ? playerName : null,
            O: randomTurn === "O" ? playerName : null,
          },
          winner: null,
          isDraw: false,
          isGameOver: false,
          createdAt: Date.now(),
          lastMove: Date.now(),
          mode: mode,
          isPublic: mode === "online",
          playerPresence: {
            X: {
              isOnline: randomTurn === "X",
              lastSeen: randomTurn === "X" ? Date.now() : 0,
            },
            O: {
              isOnline: randomTurn === "O",
              lastSeen: randomTurn === "O" ? Date.now() : 0,
            },
          },
          playAgainRequests: {
            X: false,
            O: false,
          },
          isTerminated: false,
        }

        await set(gameRef, newGame)
        setPlayerSymbol(randomTurn)
        setConnectionStatus("connected")

        const presenceRef = ref(database, `games/${gameId}/playerPresence/X`)
        onDisconnect(presenceRef).set({
          isOnline: false,
          lastSeen: Date.now(),
        })
      } else {
        // Join existing game
        const unsubscribe = onValue(
          gameRef,
          (snapshot) => {
            const game = snapshot.val()
            if (game) {
              if (mode === "custom" && game.mode !== "custom") {
                setError("Invalid game mode")
                setConnectionStatus("disconnected")
                return
              }

              if (mode === "online" && game.mode !== "online") {
                setError("Invalid game mode")
                setConnectionStatus("disconnected")
                return
              }

              if (game.isTerminated) {
                setError(game.terminationReason || "Game has been terminated")
                setConnectionStatus("disconnected")
                return
              }

              if (!game.players.O) {
                // Join as player O
                const updatedGame = {
                  ...game,
                  players: {
                    ...game.players,
                    O: playerName,
                  },
                  playerPresence: {
                    ...game.playerPresence,
                    O: {
                      isOnline: true,
                      lastSeen: Date.now(),
                    },
                  },
                }
                set(gameRef, updatedGame)
                setPlayerSymbol("O")
                setConnectionStatus("connected")

                const presenceRef = ref(database, `games/${gameId}/playerPresence/O`)
                onDisconnect(presenceRef).set({
                  isOnline: false,
                  lastSeen: Date.now(),
                })
              } else if (!game.players.X) {
                // Join as player X
                const updatedGame = {
                  ...game,
                  players: {
                    ...game.players,
                    X: playerName,
                  },
                  playerPresence: {
                    ...game.playerPresence,
                    X: {
                      isOnline: true,
                      lastSeen: Date.now(),
                    },
                  },
                }
                set(gameRef, updatedGame)
                setPlayerSymbol("X")
                setConnectionStatus("connected")

                const presenceRef = ref(database, `games/${gameId}/playerPresence/X`)
                onDisconnect(presenceRef).set({
                  isOnline: false,
                  lastSeen: Date.now(),
                })
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
  }, [gameId, playerName, isCreator, mode])

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (gameState && playerSymbol && !gameState.isTerminated) {
        // Use navigator.sendBeacon for reliable cleanup on page unload
        const gameRef = ref(database, `games/${gameId}/playerPresence/${playerSymbol}`)
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}/games/${gameId}/playerPresence/${playerSymbol}.json`,
          JSON.stringify({
            isOnline: false,
            lastSeen: Date.now(),
          }),
        )
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [gameState, playerSymbol, gameId])

  useEffect(() => {
    if (gameState && playerSymbol && !gameState.isTerminated) {
      // Update presence every 10 seconds
      presenceIntervalRef.current = setInterval(updatePresence, 10000)

      // Check for disconnected players every 15 seconds
      disconnectTimeoutRef.current = setInterval(checkForDisconnectedPlayers, 15000)
    }

    return () => {
      if (presenceIntervalRef.current) {
        clearInterval(presenceIntervalRef.current)
      }
      if (disconnectTimeoutRef.current) {
        clearInterval(disconnectTimeoutRef.current)
      }
    }
  }, [gameState, playerSymbol, updatePresence, checkForDisconnectedPlayers])

  // Initialize game on mount
  useEffect(() => {
    initializeGame()
  }, [initializeGame])

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
      unsubscribe()
      connectionUnsubscribe()
    }
  }, [gameId, isCreator, error, gameState])

  const makeMove = useCallback(
    async (position: number) => {
      console.log("[v0] makeMove called:", {
        position,
        gameState: gameState ? "exists" : "null",
        playerSymbol,
        currentPlayer: gameState?.currentPlayer,
        isGameOver: gameState?.isGameOver,
      })

      if (!gameState || !playerSymbol) {
        console.log("[v0] No game state or player symbol")
        return false
      }

      // Validate move using game logic
      if (!isValidMove(gameState.board, position, gameState.currentPlayer, playerSymbol)) {
        console.log("[v0] Invalid move attempted:", {
          position,
          currentPlayer: gameState.currentPlayer,
          playerSymbol,
          cellValue: gameState.board[position],
        })
        return false
      }

      if (gameState.isGameOver) {
        console.log("[v0] Move attempted on finished game")
        return false
      }

      const gameRef = ref(database, `games/${gameId}`)

      try {
        console.log("[v0] Making move with game logic...")

        // Make the move using game logic
        const newBoard = makeMoveLogic(gameState.board, position, playerSymbol)
        console.log("[v0] New board:", newBoard)

        // Check game result using enhanced logic
        const gameResult = checkWinner(newBoard)
        console.log("[v0] Game result:", gameResult)

        const updatedGame: GameState = {
          ...gameState,
          board: newBoard,
          currentPlayer: getNextPlayer(playerSymbol),
          winner: gameResult.winner,
          isDraw: gameResult.isDraw,
          isGameOver: gameResult.winner !== null || gameResult.isDraw,
          lastMove: Date.now(),
        }

        console.log("[v0] Updated game state:", updatedGame)

        // Optimistic update
        setGameState(updatedGame)

        // Sync to Firebase
        await set(gameRef, updatedGame)
        console.log("[v0] Move synchronized successfully with Firebase")
        return true
      } catch (err) {
        console.error("[v0] Move synchronization error:", err)
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
      board: Array(9).fill(""),
      currentPlayer: Math.random() < 0.5 ? "X" : "O",
      winner: null,
      isDraw: false,
      isGameOver: false,
      createdAt: Date.now(),
      lastMove: Date.now(),
      mode: mode,
      isPublic: mode === "online",
      playerPresence: {
        X: {
          isOnline: true,
          lastSeen: Date.now(),
        },
        O: {
          isOnline: false,
          lastSeen: 0,
        },
      },
      playAgainRequests: {
        X: false,
        O: false,
      },
      isTerminated: false, 
    }

    try {
      await set(gameRef, resetGame)
      console.log("[v0] Game reset synchronized with proper initial state")
    } catch (err) {
      console.error("Reset synchronization error:", err)
      setError("Failed to reset game")
    }
  }, [gameState, gameId])

  const requestPlayAgain = useCallback(async () => {
    if (!gameState || !playerSymbol) return

    const gameRef = ref(database, `games/${gameId}`)
    const updatedRequests = {
      ...gameState.playAgainRequests,
      [playerSymbol]: true,
    }

    try {
      // If both players have requested play again, reset the game
      if (updatedRequests.X && updatedRequests.O) {
        await resetGame()
      } else {
        // Otherwise, just update the play again request
        const updatedGame: GameState = {
          ...gameState,
          playAgainRequests: updatedRequests,
          lastMove: Date.now(),
        }
        await set(gameRef, updatedGame)
      }
    } catch (err) {
      console.error("Failed to request play again:", err)
      setError("Failed to request play again")
    }
  }, [gameState, playerSymbol, gameId, resetGame])

  const cancelPlayAgain = useCallback(async () => {
    if (!gameState || !playerSymbol) return

    const gameRef = ref(database, `games/${gameId}`)
    const updatedGame: GameState = {
      ...gameState,
      playAgainRequests: {
        ...gameState.playAgainRequests,
        [playerSymbol]: false,
      },
      lastMove: Date.now(),
    }

    try {
      await set(gameRef, updatedGame)
    } catch (err) {
      console.error("Failed to cancel play again:", err)
      setError("Failed to cancel play again")
    }
  }, [gameState, playerSymbol, gameId])

  const declinePlayAgain = useCallback(async () => {
    if (!gameState || !playerSymbol) return

    const gameRef = ref(database, `games/${gameId}`)
    const updatedGame: GameState = {
      ...gameState,
      playAgainRequests: {
        ...gameState.playAgainRequests,
        [playerSymbol === "X" ? "O" : "X"]: false,
      },
      lastMove: Date.now(),
    }

    try {
      await set(gameRef, updatedGame)
    } catch (err) {
      console.error("Failed to cancel play again:", err)
      setError("Failed to cancel play again")
    }
  }, [gameState, playerSymbol, gameId])

  return {
    gameState,
    playerSymbol,
    isLoading,
    error,
    connectionStatus,
    makeMove,
    resetGame,
    leaveGame,
    requestPlayAgain, // Added requestPlayAgain to return object
    cancelPlayAgain, // Added cancelPlayAgain to return object
    declinePlayAgain,
  }
}
