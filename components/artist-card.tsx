"use client"

import { useState } from "react"
import { Clock, MapPin, Wallet, Heart, Eye, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ArtistWithDistance } from "@/lib/types"
import { DonationModal } from "./donation-modal"
import { StreamPlayer } from "./stream-player"
import { useStore } from "@/lib/store"

interface ArtistCardProps {
  artist: ArtistWithDistance
}

export function ArtistCard({ artist }: ArtistCardProps) {
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const getStreamByArtistId = useStore((state) => state.getStreamByArtistId)

  const stream = getStreamByArtistId(artist.id)

  const timeRemaining = () => {
    const now = new Date()
    const createdAt = new Date(artist.createdAt)
    const endTime = new Date(createdAt.getTime() + artist.duration * 60000)
    const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 60000))
    return remaining
  }

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${artist.latitude},${artist.longitude}`
    window.open(url, "_blank")
  }

  return (
    <>
      <div className="group relative bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
        {/* Stream Player */}
        <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
          {stream && stream.isLive ? (
            <StreamPlayer stream={stream} autoPlay={false} showControls={true} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <div className="text-center text-slate-400">
                <div className="w-16 h-16 bg-slate-600/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="h-8 w-8" />
                </div>
                <p className="text-sm font-medium">Offline</p>
              </div>
            </div>
          )}

          {/* Live Badge */}
          {artist.isActive && stream?.isLive && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-red-500 hover:bg-red-500 text-white border-0 px-3 py-1 text-xs font-semibold rounded-full shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                LIVE
              </Badge>
            </div>
          )}

          {/* Viewers */}
          {stream?.isLive && (
            <div className="absolute top-4 right-4">
              <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                <Eye className="h-3 w-3 text-white" />
                <span className="text-white text-xs font-medium">{stream.viewerCount}</span>
              </div>
            </div>
          )}

          {/* Like Button */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="absolute bottom-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-all duration-300 hover:scale-110"
          >
            <Heart
              className={`h-4 w-4 transition-all duration-300 ${isLiked ? "text-red-400 fill-red-400 scale-110" : "text-white/70"}`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-violet-300 transition-colors">
              {artist.name}
            </h3>
            {stream?.isLive && <p className="text-slate-400 text-sm">{stream.title}</p>}
          </div>

          {/* Location */}
          <div
            className="flex items-center space-x-2 text-slate-400 mb-4 cursor-pointer hover:text-white transition-colors group/location"
            onClick={openGoogleMaps}
          >
            <MapPin className="h-4 w-4 group-hover/location:text-blue-400 transition-colors" />
            <span className="text-sm truncate flex-1">{artist.location}</span>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover/location:opacity-100 transition-opacity" />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2 text-slate-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{timeRemaining()}m left</span>
            </div>
            {artist.distance !== undefined && (
              <div className="bg-blue-500/20 text-blue-300 rounded-full px-3 py-1">
                <span className="text-xs font-medium">{artist.distance.toFixed(1)}km</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 rounded-xl"
              onClick={openGoogleMaps}
            >
              <MapPin className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0 rounded-xl shadow-lg"
              onClick={() => setShowDonationModal(true)}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Tip
            </Button>
          </div>
        </div>
      </div>

      <DonationModal artist={artist} isOpen={showDonationModal} onClose={() => setShowDonationModal(false)} />
    </>
  )
}
