"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Eye, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import type { StreamData } from "@/lib/types"

interface StreamPlayerProps {
  stream: StreamData
  className?: string
  autoPlay?: boolean
  showControls?: boolean
}

export function StreamPlayer({ stream, className = "", autoPlay = false, showControls = true }: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState([0.7])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)

    video.addEventListener("timeupdate", updateTime)
    video.addEventListener("loadedmetadata", updateDuration)
    video.addEventListener("ended", () => setIsPlaying(false))

    return () => {
      video.removeEventListener("timeupdate", updateTime)
      video.removeEventListener("loadedmetadata", updateDuration)
      video.removeEventListener("ended", () => setIsPlaying(false))
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.play().catch(console.error)
    } else {
      video.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.volume = volume[0]
    video.muted = isMuted
  }, [volume, isMuted])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume)
    if (newVolume[0] > 0) {
      setIsMuted(false)
    }
  }

  const handleSeek = (newTime: number[]) => {
    const video = videoRef.current
    if (video) {
      video.currentTime = newTime[0]
      setCurrentTime(newTime[0])
    }
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden group ${className}`}>
      {/* Live Badge */}
      {stream.isLive && (
        <div className="absolute top-4 left-4 z-20">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-75 animate-pulse"></div>
            <Badge className="relative bg-red-500 hover:bg-red-500 text-white border-0 px-3 py-1 text-sm font-bold rounded-full">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              EN VIVO
            </Badge>
          </div>
        </div>
      )}

      {/* Viewer Count */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
          <Eye className="h-3 w-3 text-white" />
          <span className="text-white text-xs font-medium">{stream.viewerCount}</span>
        </div>
      </div>

      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={stream.thumbnailUrl}
        loop
        playsInline
        preload="metadata"
      >
        {stream.demoVideoUrl && <source src={stream.demoVideoUrl} type="video/mp4" />}
        <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
          <div className="text-center text-white">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold">{stream.title}</p>
            <p className="text-sm opacity-75">Stream en vivo</p>
          </div>
        </div>
      </video>

      {/* Play Overlay (when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
          <Button
            onClick={togglePlay}
            size="lg"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0 rounded-full w-16 h-16 p-0"
          >
            <Play className="h-8 w-8 text-white ml-1" />
          </Button>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          {/* Progress Bar */}
          <div className="mb-3">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/70 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button onClick={togglePlay} size="sm" variant="ghost" className="text-white hover:bg-white/20">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <div className="flex items-center gap-2">
                <Button onClick={toggleMute} size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  {isMuted || volume[0] === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <div className="w-20">
                  <Slider value={volume} max={1} step={0.1} onValueChange={handleVolumeChange} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-white text-sm">
                <span className="font-medium">{stream.title}</span>
              </div>
              <Button onClick={toggleFullscreen} size="sm" variant="ghost" className="text-white hover:bg-white/20">
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stream Info Overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
          <h3 className="text-white font-semibold text-lg">{stream.title}</h3>
          {stream.description && <p className="text-white/80 text-sm">{stream.description}</p>}
        </div>
      </div>
    </div>
  )
}
