"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useGame } from "@/hooks/use-game"
import { GameBoard } from "@/components/game-board"
import { GameHeader } from "@/components/game-header"
import { GameStatus } from "@/components/game-status"
import { ConnectionStatus } from "@/components/connection-status"
import { PlayerPresence } from "@/components/player-presence"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, Check, Share2, Globe, Lock, LogOut, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import type { GameMode } from "@/types/game"
import { database } from "@/lib/firebase"
import { ref, remove } from "firebase/database"

export default function GamePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const gameId = params.id as string
  const playerName = searchParams.get("player") || ""
  const isCreator = searchParams.get("create") === "true"
  const mode = (searchParams.get("mode") as GameMode) || "custom"

  const [copied, setCopied] = useState(false)

  const {
    gameState,
    playerSymbol,
    isLoading,
    error,
    connectionStatus,
    makeMove,
    resetGame,
    leaveGame,
    requestPlayAgain,
    cancelPlayAgain,
    declinePlayAgain
  } = useGame(gameId, playerName, isCreator, mode)

  const copyGameCode = async () => {
    try {
      await navigator.clipboard.writeText(gameId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const shareGame = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Tic Tac Toe game!",
          text: `Use code ${gameId} to join my game`,
          url: window.location.href.split("?")[0] + `?player=Player#${Math.floor(Math.random() * 10000)}&mode=${mode}`,
        })
      } catch (err) {
        copyGameCode()
      }
    } else {
      copyGameCode()
    }
  }

  const handleLeaveGame = async () => {
    if (confirm("Are you sure you want to leave the game? This will end the game for both players.")) {
      await leaveGame()
      await deleteGame()
    }
  }

  const deleteGame = async () => {
    if (!gameId) return
    await remove(ref(database, `games/${gameId}`))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground">Loading game...</p>
        </div>
      </div>
    )
  }

  if (error && error !== "Game not found") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md w-full bg-card/50 backdrop-blur border-border/50">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4 text-destructive">Game Error</h2>
          <p className="text-muted-foreground mb-8 text-lg">{error}</p>
          <Button onClick={() => router.push("/")} variant="outline" className="w-full h-12">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Card>
      </div>
    )
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Game not found!</h2>
          <Button onClick={() => router.push("/")} variant="outline" className="w-full h-12">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const otherPlayerSymbol = playerSymbol === "X" ? "O" : "X"
  const waitingForPlayer = otherPlayerSymbol === "X" ? !gameState.players?.X : !gameState.players?.O
  const otherPlayerName = otherPlayerSymbol && gameState.players[otherPlayerSymbol]
  const hasRequestedPlayAgain = gameState.playAgainRequests[playerSymbol!]
  const otherPlayerRequestedPlayAgain = gameState.playAgainRequests[otherPlayerSymbol]

  console.log("[v0] Game state:", {
    waitingForPlayer,
    isGameOver: gameState.isGameOver,
    winner: gameState.winner,
    isDraw: gameState.isDraw,
    playersO: gameState.players.O,
    playersX: gameState.players.X,
    isTerminated: gameState.isTerminated,
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/80" />

      <div className={`relative ${gameState.isTerminated ? "p-0" : "p-4"}`}>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          {!gameState.isTerminated && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              {waitingForPlayer && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async() => {router.push("/");await deleteGame()}}
                  className="text-muted-foreground hover:text-foreground h-10 w-25"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}

              {/* Leave Game Button */}
              {!waitingForPlayer && !gameState.isTerminated && (
                <Button onClick={handleLeaveGame} variant="destructive" size="sm" className="h-10">
                  <LogOut className="h-4 w-4 mr-2" />
                  Leave Game
                </Button>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <ConnectionStatus status={connectionStatus} />

                <Badge variant="secondary" className="flex items-center gap-1">
                  {gameState.mode === "online" ? (
                    <>
                      <Globe className="h-3 w-3" />
                      Online Mode
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3" />
                      Custom Mode
                    </>
                  )}
                </Badge>
                
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
                    {!gameState.isPublic && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">Game Code:</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyGameCode}
                          className="font-mono text-lg px-4 bg-transparent h-10"
                        >
                          {gameId}
                          {copied ? <Check className="h-4 w-4 ml-2 text-green-500" /> : <Copy className="h-4 w-4 ml-2" />}
                        </Button>
                      </div>
                    )}
                    <Button variant="outline" size="sm" onClick={shareGame} className="h-10 px-3 bg-transparent">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>              
              </div>
            </div> 
          )}

          {/* Game Terminated Message */}
          {gameState.isTerminated && (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
              <Card className="p-8 text-center max-w-md w-full bg-card/50 backdrop-blur border-border/50">
                <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-4 text-destructive">Game Terminated</h2>
                <p className="text-muted-foreground mb-8 text-lg">{gameState.quitter === playerSymbol ? "You left the game!" : "Your opponent left the game!"}</p>
                <Button onClick={() => router.push("/")} variant="outline" className="w-full h-12">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Card>
            </div>
          )}

          {/* Game Header */}
          {!gameState.isTerminated && (
            <GameHeader gameState={gameState} playerSymbol={playerSymbol} playerName={playerName} />
          )}

          {/* Waiting for Player */}
          {waitingForPlayer && !gameState.isTerminated && (
            <Card className="p-8 mb-8 text-center bg-card/50 backdrop-blur border-border/50">
              <h3 className="text-xl font-semibold mb-4">Waiting for Player</h3>
              <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                {gameState.mode === "online" ? (
                  <>
                    Your room is public and visible in the room list. Players can join directly.
                  </>
                ) : (
                  <>
                    Share the game code <span className="font-mono font-bold text-primary">{gameId}</span> with a friend
                    to start playing.
                  </>
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {!gameState.isPublic && (
                  <Button onClick={copyGameCode} variant="outline" className="h-12 bg-transparent">
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Game Code
                      </>
                    )}
                  </Button>
                )}
                <Button onClick={shareGame} className="h-12">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Game
                </Button>
                <Button onClick={handleLeaveGame} variant="destructive" className="h-12" disabled={!waitingForPlayer.O}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Leave Game
                </Button>
              </div>
            </Card>
          )}

          {/* Play Again Synchronization */}
          {gameState.isGameOver &&
            !gameState.isTerminated &&
            (hasRequestedPlayAgain || otherPlayerRequestedPlayAgain) && (
              <Card className="p-6 mb-8 text-center bg-primary/5 backdrop-blur border-primary/30">
                <h3 className="text-lg font-semibold">Play Again Request</h3>
                {hasRequestedPlayAgain && otherPlayerRequestedPlayAgain ? (
                  <p className="text-muted-foreground mb-4">Both players want to play again! Starting new game...</p>
                ) : hasRequestedPlayAgain ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">Waiting for {otherPlayerName} to accept play again...</p>
                    <Button onClick={cancelPlayAgain} variant="outline" className="h-10 bg-transparent">
                      Cancel Request
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">{otherPlayerName} wants to play again!</p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={requestPlayAgain} className="h-10">
                        Accept
                      </Button>
                      <Button onClick={declinePlayAgain} variant="outline" className="h-10">
                        Decline
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}

          {/* Game Status */}
          {!gameState.isTerminated && (
            <GameStatus
              gameState={gameState}
              playerSymbol={playerSymbol}
              onReset={requestPlayAgain}
              hasRequestedPlayAgain={hasRequestedPlayAgain}
              otherPlayerRequestedPlayAgain={otherPlayerRequestedPlayAgain}
            />
          )}

          {/* Game Board */}
          {!waitingForPlayer && !gameState.isTerminated ? (
            <>
              <GameBoard gameState={gameState} playerSymbol={playerSymbol} onMove={makeMove} />
              {console.log("[v0] Rendering game board")}
            </>
          ) : (
            console.log("[v0] Not rendering game board - waiting for player or game terminated")
          )}
        </div>
      </div>
    </div>
  )
}
