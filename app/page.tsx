"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gamepad2, Users, Zap, Wifi, Shield, Smartphone, Globe, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

type GameMode = "online" | "custom" | null

export default function HomePage() {
  const [selectedMode, setSelectedMode] = useState<GameMode>(null)
  const router = useRouter()

  const selectMode = (mode: GameMode) => {
    setSelectedMode(mode)
  }

  const goBack = () => {
    setSelectedMode(null)
  }

  if (selectedMode === "online") {
    return <OnlineModeScreen onBack={goBack} />
  }

  if (selectedMode === "custom") {
    return <CustomModeScreen onBack={goBack} />
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
            <div className="flex items-center justify-center gap-4 mb-6 mt-4">
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
              Choose your game mode and challenge other players to a game of<br />Tic Tac Toe!
            </p>
          </div>

          {/* Game Mode Selection Cards */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
            {/* Online Mode */}
            <Card
              className="bg-card/50 backdrop-blur border-border/50 hover:bg-card/60 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              onClick={() => selectMode("online")}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Online Mode</CardTitle>
                    <CardDescription className="text-base">Browse and join public games</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Create public rooms or browse available games. Just pick a room and start playing!
                </p>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Users className="h-4 w-4" />
                  <span>Public room list</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Zap className="h-4 w-4" />
                  <span>Instant matchmaking</span>
                </div>
              </CardContent>
            </Card>

            {/* Custom Mode */}
            <Card
              className="bg-card/50 backdrop-blur border-border/50 hover:bg-card/60 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              onClick={() => selectMode("custom")}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Custom Mode</CardTitle>
                    <CardDescription className="text-base">Private games with invite codes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Create private rooms with unique 6-character codes. Share the code with friends to invite them!
                </p>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Shield className="h-4 w-4" />
                  <span>Private rooms</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Lock className="h-4 w-4" />
                  <span>6-character codes</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-10">
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
              <div className="p-4 bg-primary/10 rounded-2xl w-fit mx-auto mb-6 border border-primary/20">
                <Users className="h-8 w-8 text-primary" />
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
        </div>
      </div>
    </div>
  )
}

// Online Mode Screen Component
function OnlineModeScreen({ onBack }: { onBack: () => void }) {
  const [playerName, setPlayerName] = useState(localStorage.getItem("playerNameTicTacToe") || `Player#${Math.floor(Math.random() * 10000)}`)
  const router = useRouter()

  const createOnlineGame = () => {
    if (!playerName.trim()) return
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase()
    router.push(`/game/${gameId}?player=${encodeURIComponent(playerName)}&create=true&mode=online`)
  }

  const browseRooms = () => {
    if (!playerName.trim()) return
    router.push(`/rooms?player=${encodeURIComponent(playerName)}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/80" />

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Button variant="outline" className="bg-transparent mb-6" onClick={onBack}>
              ← Back to Mode Selection
            </Button>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Online Mode</h1>
            </div>
            <p className="text-lg text-muted-foreground">Create public rooms or browse available games</p>
          </div>

          {/* Player Name Input */}
          <Card className="bg-card/50 backdrop-blur border-border/50 mb-8">
            <CardContent className="px-6 py-2">
              <div className="flex items-center gap-2">
                <label htmlFor="player-name" className="text-md font-medium">
                  Name:
                </label>
                <input
                  id="player-name"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => { localStorage.setItem("playerNameTicTacToe", e.target.value); setPlayerName(e.target.value) }}
                  className="w-full bg-input/50 border border-border/50 rounded-lg px-4 py-3 text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Game Options */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur border-border/50 hover:bg-card/60 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  Create Public Room
                </CardTitle>
                <CardDescription>Start a new game that others can join</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={createOnlineGame}
                  variant="outline"
                  className="w-full bg-transparent"
                  disabled={!playerName.trim()}
                >
                  Create Room
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50 hover:bg-card/60 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  Browse Rooms
                </CardTitle>
                <CardDescription>Join an existing public game</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={browseRooms}
                  variant="outline"
                  className="w-full bg-transparent"
                  disabled={!playerName.trim()}
                >
                  Browse Available Rooms
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Custom Mode Screen Component
function CustomModeScreen({ onBack }: { onBack: () => void }) {
  const [gameCode, setGameCode] = useState("")
  const [playerName, setPlayerName] = useState(localStorage.getItem("playerNameTicTacToe") || `Player#${Math.floor(Math.random() * 10000)}`)
  const router = useRouter()

  const createCustomGame = () => {
    if (!playerName.trim()) return
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase()
    router.push(`/game/${gameId}?player=${encodeURIComponent(playerName)}&create=true&mode=custom`)
  }

  const joinCustomGame = () => {
    if (!gameCode.trim() || !playerName.trim()) return
    router.push(`/game/${gameCode.toUpperCase()}?player=${encodeURIComponent(playerName)}&mode=custom`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/80" />

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Button variant="outline" onClick={onBack} className="bg-transparent mb-6">
              ← Back to Mode Selection
            </Button>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Custom Mode</h1>
            </div>
            <p className="text-lg text-muted-foreground">Create private rooms with unique 6-character codes</p>
          </div>

          {/* Player Name Input */}
          <Card className="bg-card/50 backdrop-blur border-border/50 mb-8">
            <CardContent className="px-6 py-2">
              <div className="flex items-center gap-2">
                <label htmlFor="player-name" className="text-md font-medium">
                  Name:
                </label>
                <input
                  id="player-name"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => { localStorage.setItem("playerNameTicTacToe", e.target.value); setPlayerName(e.target.value) }}
                  className="w-full bg-input/50 border border-border/50 rounded-lg px-4 py-3 text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Game Options */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Create Game */}
            <Card className="bg-card/50 backdrop-blur border-border/50 hover:bg-card/60 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  Create Private Room
                </CardTitle>
                <CardDescription>Start a new private game</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  onClick={createCustomGame}
                  variant="outline"
                  className="w-full bg-transparent"
                  disabled={!playerName.trim()}
                >
                  Create Private Room
                </Button>
              </CardContent>
            </Card>

            {/* Join Game */}
            <Card className="bg-card/50 backdrop-blur border-border/50 hover:bg-card/60 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  Join Private Room
                </CardTitle>
                <CardDescription>Enter a 6-character code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-2 max-sm:flex-col max-sm:items-start">
                  <label htmlFor="game-code" className="text-sm font-medium whitespace-nowrap">
                    Room Code:
                  </label>
                  <input
                    id="game-code"
                    placeholder="Enter 6-character code"
                    value={gameCode}
                    autoComplete="off"
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="w-full bg-input/50 border border-border/50 rounded-lg px-4 py-1 font-mono text-center text-lg sm:text-xl tracking-wider"
                  />
                </div>
                <Button
                  onClick={joinCustomGame}
                  variant="outline"
                  className="w-full bg-transparent"
                  disabled={!gameCode.trim() || !playerName.trim() || gameCode.length !== 6}
                >
                  Join Private Room
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
