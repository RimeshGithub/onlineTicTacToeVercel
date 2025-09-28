"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Gamepad2, Users, Zap, Wifi, Shield, Smartphone } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [gameCode, setGameCode] = useState("")
  const [playerName, setPlayerName] = useState("")
  const router = useRouter()

  const createGame = () => {
    if (!playerName.trim()) return
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase()
    router.push(`/game/${gameId}?player=${encodeURIComponent(playerName)}&create=true`)
  }

  const joinGame = () => {
    if (!gameCode.trim() || !playerName.trim()) return
    router.push(`/game/${gameCode.toUpperCase()}?player=${encodeURIComponent(playerName)}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/80" />

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 bg-primary/10 rounded-2xl backdrop-blur border border-primary/20">
                <Gamepad2 className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Tic Tac Toe
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mt-2">Online Multiplayer</p>
              </div>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Challenge your friends to the classic game of strategy. Create a room or join an existing game with{" "}
              <span className="text-primary font-semibold">real-time synchronization</span>.
            </p>
          </div>

          {/* Game Options */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
            {/* Create Game */}
            <Card className="bg-card/50 backdrop-blur border-border/50 hover:bg-card/60 transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Create New Game</CardTitle>
                    <CardDescription className="text-base">Start a new game and invite friends</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="create-name" className="text-sm font-medium">
                    Your Name
                  </Label>
                  <Input
                    id="create-name"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="bg-input/50 border-border/50 h-12 text-base"
                  />
                </div>
                <Button
                  onClick={createGame}
                  className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold"
                  disabled={!playerName.trim()}
                >
                  Create Game Room
                </Button>
              </CardContent>
            </Card>

            {/* Join Game */}
            <Card className="bg-card/50 backdrop-blur border-border/50 hover:bg-card/60 transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl border border-accent/20">
                    <Zap className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Join Existing Game</CardTitle>
                    <CardDescription className="text-base">Enter a game code to join</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="join-name" className="text-sm font-medium">
                    Your Name
                  </Label>
                  <Input
                    id="join-name"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="bg-input/50 border-border/50 h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="game-code" className="text-sm font-medium">
                    Game Code
                  </Label>
                  <Input
                    id="game-code"
                    placeholder="Enter 6-digit code"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="bg-input/50 border-border/50 font-mono text-center text-xl tracking-wider h-12"
                  />
                </div>
                <Button
                  onClick={joinGame}
                  variant="outline"
                  className="w-full h-12 text-base font-semibold bg-transparent hover:bg-accent/10"
                  disabled={!gameCode.trim() || !playerName.trim() || gameCode.length !== 6}
                >
                  Join Game
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 rounded-2xl bg-card/30 backdrop-blur border border-border/50 hover:bg-card/40 transition-all duration-300">
              <div className="p-4 bg-primary/10 rounded-2xl w-fit mx-auto mb-6 border border-primary/20">
                <Wifi className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Sync</h3>
              <p className="text-muted-foreground leading-relaxed">
                Moves update instantly across all devices with Firebase real-time database technology
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-card/30 backdrop-blur border border-border/50 hover:bg-card/40 transition-all duration-300">
              <div className="p-4 bg-accent/10 rounded-2xl w-fit mx-auto mb-6 border border-accent/20">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Sharing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Share a simple 6-digit code to invite friends to your game instantly
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-card/30 backdrop-blur border border-border/50 hover:bg-card/40 transition-all duration-300">
              <div className="p-4 bg-primary/10 rounded-2xl w-fit mx-auto mb-6 border border-primary/20">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Detection</h3>
              <p className="text-muted-foreground leading-relaxed">
                Automatic win and draw detection with comprehensive game state management
              </p>
            </div>
          </div>

          {/* Mobile Optimized Badge */}
          <div className="flex items-center justify-center mt-12">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-full border border-border/50">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Optimized for mobile & desktop</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
