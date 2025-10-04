"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Clock, Search, RefreshCw, ArrowLeft, Play } from "lucide-react"
import { ref, onValue, off, query, orderByChild, equalTo } from "firebase/database"
import { database } from "@/lib/firebase"
import type { GameState } from "@/types/game"

function RoomsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const playerName = searchParams.get("player") || ""

  const [rooms, setRooms] = useState<GameState[]>([])
  const [filteredRooms, setFilteredRooms] = useState<GameState[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load available rooms
  useEffect(() => {
    const roomsRef = ref(database, "games")
    const publicRoomsQuery = query(roomsRef, orderByChild("isPublic"), equalTo(true))

    const unsubscribe = onValue(publicRoomsQuery, (snapshot) => {
      const gamesData = snapshot.val()
      if (gamesData) {
        const availableRooms = Object.values(gamesData as Record<string, GameState>)
          .filter(
            (room) =>
              room.mode === "online" && room.isPublic && !room.isGameOver && (!room.players.O || !room.players.X), // At least one slot available
          )
          .sort((a, b) => b.createdAt - a.createdAt) // Most recent first

        setRooms(availableRooms)
        setFilteredRooms(availableRooms)
      } else {
        setRooms([])
        setFilteredRooms([])
      }
      setIsLoading(false)
      setIsRefreshing(false)
    })

    return () => off(roomsRef, "value", unsubscribe)
  }, [])

  // Filter rooms based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRooms(rooms)
    } else {
      const filtered = rooms.filter(
        (room) =>
          room.players.X?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredRooms(filtered)
    }
  }, [searchTerm, rooms])

  const joinRoom = (roomId: string) => {
    if (!playerName) {
      router.push("/")
      return
    }
    router.push(`/game/${roomId}?player=${encodeURIComponent(playerName)}&mode=online`)
  }

  const refreshRooms = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1500)
  }

  const goBack = () => {
    router.push("/")
  }

  const createRoom = () => {
    if (!playerName) {
      router.push("/")
      return
    }
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase()
    router.push(`/game/${gameId}?player=${encodeURIComponent(playerName)}&create=true&mode=online`)
  }

  const getPlayerCount = (room: GameState) => {
    let count = 0
    if (room.players.X) count++
    if (room.players.O) count++
    return count
  }

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  if (!playerName) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Player name is required to browse rooms.</p>
            <Button onClick={goBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/80" />

      <div className="relative min-h-screen p-4 max-w-2xl mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col mb-8 gap-4">
            <Button variant="ghost" onClick={goBack} className="text-muted-foreground hover:text-foreground h-10 w-25">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl md:text-4xl font-bold">Available Rooms</h1>
                <Button onClick={createRoom} className="bg-primary hover:bg-primary/90">
                  Create New Room
                </Button>
            </div>
          </div>

          {/* Search and Refresh */}
          <div className="flex gap-4 mb-6 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rooms or players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input/50 border-border/50"
              />
            </div>
            <Button variant="outline" onClick={refreshRooms} disabled={isRefreshing} className="bg-transparent">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Rooms List */}
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading available rooms...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No rooms available</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? "No rooms match your search." : "Be the first to create a room!"}
                </p>
                <Button onClick={createRoom} className="bg-primary hover:bg-primary/90">
                  Create New Room
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRooms.map((room) => (
                <Card
                  key={room.id}
                  className="gap-2 bg-card/50 backdrop-blur border-border/50 hover:bg-card/60 transition-all duration-300 hover:scale-[1.02]"
                >
                  <CardHeader className="pb-1">
                    <CardTitle className="text-lg font-mono">{room.id}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {getTimeAgo(room.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Created by: {room.players.X || room.players.O || "Unknown"}</span>
                    </div>
                    <Button
                      onClick={() => joinRoom(room.id)}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      Join Room
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RoomsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <RoomsPageContent />
    </Suspense>
  )
}
