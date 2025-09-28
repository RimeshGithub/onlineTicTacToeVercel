"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useGame } from "@/hooks/use-game"
import { GameBoard } from "@/components/game-board"
import { GameHeader } from "@/components/game-header"
import { GameStatus } from "@/components/game-status"
import { ConnectionStatus } from "@/components/connection-status"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Check, Share2 } from "lucide-react"
import { useState } from "react"

export default function GamePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const gameId = params.id as string
  const playerName = searchParams.get("player") || ""
  const isCreator = searchParams.get("create") === "true"

  const [copied, setCopied] = useState(false)

  const { gameState, playerSymbol, isLoading, error, connectionStatus, makeMove, resetGame } = useGame(
    gameId,
    playerName,
    isCreator,
  )

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
          url: window.location.href,
        })
      } catch (err) {
        copyGameCode()
      }
    } else {
      copyGameCode()
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md w-full bg-card/50 backdrop-blur border-border/50">
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
          <p className="text-lg text-muted-foreground">Game not found</p>
        </div>
      </div>
    )
  }

  const waitingForPlayer = !gameState.players.O

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/80" />

      <div className="relative p-4 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-muted-foreground hover:text-foreground h-10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <ConnectionStatus status={connectionStatus} />

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Game Code:</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyGameCode}
                    className="font-mono text-lg px-4 bg-transparent h-10"
                  >
                    {gameId}
                    {copied ? <Check className="h-4 w-4 ml-2 text-green-500" /> : <Copy className="h-4 w-4 ml-2" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareGame} className="h-10 px-3 bg-transparent">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Game Header */}
          <GameHeader gameState={gameState} playerSymbol={playerSymbol} playerName={playerName} />

          {/* Waiting for Player */}
          {waitingForPlayer && (
            <Card className="p-8 mb-8 text-center bg-card/50 backdrop-blur border-border/50">
              <h3 className="text-xl font-semibold mb-4">Waiting for Player</h3>
              <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                Share the game code <span className="font-mono font-bold text-primary">{gameId}</span> with a friend to
                start playing
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
                <Button onClick={shareGame} className="h-12">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Game
                </Button>
              </div>
            </Card>
          )}

          {/* Game Status */}
          <GameStatus gameState={gameState} playerSymbol={playerSymbol} onReset={resetGame} />

          {/* Game Board */}
          {!waitingForPlayer && <GameBoard gameState={gameState} playerSymbol={playerSymbol} onMove={makeMove} />}
        </div>
      </div>
    </div>
  )
}
