"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConnectionStatusProps {
  status: "connected" | "disconnected" | "connecting"
  className?: string
}

export function ConnectionStatus({ status, className }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "connected":
        return {
          icon: Wifi,
          text: "Connected",
          variant: "default" as const,
          className: "bg-green-500/10 text-green-500 border-green-500/20 shadow-sm",
        }
      case "disconnected":
        return {
          icon: WifiOff,
          text: "Disconnected",
          variant: "destructive" as const,
          className: "bg-red-500/10 text-red-500 border-red-500/20 shadow-sm",
        }
      case "connecting":
        return {
          icon: Loader2,
          text: "Connecting",
          variant: "secondary" as const,
          className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-sm",
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Badge
      variant={config.variant}
      className={cn("flex items-center gap-2 text-xs px-3 py-1.5 font-medium", config.className, className)}
    >
      <Icon className={cn("h-3 w-3", status === "connecting" && "animate-spin")} />
      <span className="hidden sm:inline">{config.text}</span>
    </Badge>
  )
}
