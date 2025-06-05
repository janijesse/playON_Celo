"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  DollarSign,
  Clock,
  Wallet,
  Video,
  VideoOff,
  MapPin,
  Timer,
  Play,
  Pause,
  Settings,
  TrendingUp,
  Home,
  LogOut,
  Eye,
  Heart,
  Users,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useStore } from "@/lib/store"
import { StreamPlayer } from "@/components/stream-player"

export default function ArtistDashboard() {
  const router = useRouter()
  const auth = useStore((state) => state.auth)
  const donations = useStore((state) => state.donations)
  const logout = useStore((state) => state.logout)
  const getUserArtistProfile = useStore((state) => state.getUserArtistProfile)
  const getStreamByArtistId = useStore((state) => state.getStreamByArtistId)
  const startStream = useStore((state) => state.startStream)
  const stopStream = useStore((state) => state.stopStream)
  const updateArtist = useStore((state) => state.updateArtist)

  const [showStreamModal, setShowStreamModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [streamForm, setStreamForm] = useState({
    title: "",
    description: "",
  })
  const [locationForm, setLocationForm] = useState({
    location: "",
    latitude: "",
    longitude: "",
    duration: "120",
  })

  const artist = auth.currentUser ? getUserArtistProfile(auth.currentUser.id) : null
  const stream = artist ? getStreamByArtistId(artist.id) : null
  const artistDonations = artist ? donations.filter((d) => d.artistId === artist.id) : []

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.currentUser || auth.currentUser.type !== "artist") {
      router.push("/")
      return
    }

    // If artist doesn't have a profile, redirect to setup
    if (!artist) {
      router.push("/artist/setup")
      return
    }
  }, [auth, router, artist])

  useEffect(() => {
    if (artist) {
      setLocationForm({
        location: artist.location,
        latitude: artist.latitude.toString(),
        longitude: artist.longitude.toString(),
        duration: artist.duration.toString(),
      })
    }
  }, [artist])

  const handleStartStream = () => {
    if (!artist) return
    if (streamForm.title.trim()) {
      startStream(artist.id, streamForm.title, streamForm.description)
      setShowStreamModal(false)
      setStreamForm({ title: "", description: "" })
    }
  }

  const handleStopStream = () => {
    if (stream) {
      stopStream(stream.id)
    }
  }

  const handleUpdateLocation = () => {
    if (!artist) return
    const lat = Number.parseFloat(locationForm.latitude)
    const lng = Number.parseFloat(locationForm.longitude)
    const dur = Number.parseInt(locationForm.duration)

    if (!isNaN(lat) && !isNaN(lng) && !isNaN(dur) && locationForm.location.trim()) {
      updateArtist(artist.id, {
        location: locationForm.location,
        latitude: lat,
        longitude: lng,
        duration: dur,
        createdAt: new Date(),
      })
      setShowLocationModal(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationForm({
            ...locationForm,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            location: "Current location",
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  const timeRemaining = () => {
    if (!artist) return 0
    try {
      const now = new Date()
      const createdAt = new Date(artist.createdAt)
      const endTime = new Date(createdAt.getTime() + artist.duration * 60000)
      return Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 60000))
    } catch (err) {
      return 0
    }
  }

  const totalDonations = artistDonations.reduce((sum, donation) => {
    try {
      return sum + Number.parseFloat(donation.amount)
    } catch (err) {
      return sum
    }
  }, 0)

  const uniqueDonors = new Set(artistDonations.map((d) => d.donorAddress)).size

  if (!auth.isAuthenticated || !auth.currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-xl border-white/20 rounded-3xl">
          <CardContent className="pt-6 text-center">
            <div className="w-20 h-20 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="h-10 w-10 text-violet-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Complete Your Profile</h3>
            <p className="text-slate-300 mb-6">Set up your artist profile to start performing and earning tips.</p>
            <Button
              onClick={() => router.push("/artist/setup")}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl py-3 font-semibold"
            >
              Complete Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎭</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Welcome back, {artist.name}!</h1>
                <div className="flex items-center space-x-3">
                  <Badge
                    variant={stream?.isLive ? "default" : "secondary"}
                    className={`${stream?.isLive ? "bg-green-500" : "bg-slate-600"} text-xs font-medium`}
                  >
                    {stream?.isLive ? "🔴 LIVE" : "⏸️ OFFLINE"}
                  </Badge>
                  <span className="text-slate-400 text-sm">{stream?.viewerCount || 0} viewers</span>
                  <span className="text-slate-400 text-sm">•</span>
                  <span className="text-slate-400 text-sm">{timeRemaining()}m left</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 rounded-xl"
              >
                <Home className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => {
                  logout()
                  router.push("/")
                }}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 rounded-xl"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{totalDonations.toFixed(3)}</p>
              <p className="text-slate-400 text-sm">ETH earned</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
            <CardContent className="p-6 text-center">
              <Eye className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{stream?.viewerCount || 0}</p>
              <p className="text-slate-400 text-sm">Current viewers</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 text-red-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{uniqueDonors}</p>
              <p className="text-slate-400 text-sm">Supporters</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-violet-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{timeRemaining()}</p>
              <p className="text-slate-400 text-sm">Minutes left</p>
            </CardContent>
          </Card>
        </div>

        {/* Stream Control & Performance */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Stream Control */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Video className="h-5 w-5" />
                  <span>Live Stream</span>
                </span>
                {stream?.isLive && (
                  <Badge className="bg-red-500 text-white">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    LIVE
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <div className="aspect-video">
              {stream?.isLive ? (
                <StreamPlayer stream={stream} autoPlay={false} showControls={true} />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <VideoOff className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">Stream Offline</p>
                    <p className="text-sm opacity-75">Start streaming to go live</p>
                  </div>
                </div>
              )}
            </div>
            <CardContent className="p-6">
              <div className="flex space-x-3">
                {!stream?.isLive ? (
                  <Button
                    onClick={() => setShowStreamModal(true)}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Go Live
                  </Button>
                ) : (
                  <Button
                    onClick={handleStopStream}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Stream
                  </Button>
                )}
                <Button
                  onClick={() => setShowLocationModal(true)}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 rounded-xl px-4"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-emerald-400">{artistDonations.length}</p>
                  <p className="text-sm text-slate-400">Total tips</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-blue-400">
                    {artistDonations.length > 0 ? (totalDonations / artistDonations.length).toFixed(4) : "0.000"}
                  </p>
                  <p className="text-sm text-slate-400">Avg tip (ETH)</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Location</span>
                  <span className="text-white text-sm">{artist.location}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Session duration</span>
                  <span className="text-white text-sm">{artist.duration} minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Wallet</span>
                  <span className="text-white text-sm font-mono">
                    {artist.walletAddress.slice(0, 6)}...{artist.walletAddress.slice(-4)}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="text-white font-medium">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setShowLocationModal(true)}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 rounded-xl"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Update Location
                  </Button>
                  <Button
                    onClick={() => router.push("/")}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 rounded-xl"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View Public
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tips */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <span>Recent Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {artistDonations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-violet-400" />
                </div>
                <p className="text-slate-300 font-medium">No tips yet</p>
                <p className="text-sm text-slate-400 mt-1">Start streaming to receive tips from your fans!</p>
                <Button
                  onClick={() => setShowStreamModal(true)}
                  className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl"
                >
                  <Play className="h-4 w-4 mr-2" />
                 
                </Button>
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {artistDonations.slice(0, 10).map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{donation.token.icon}</div>
                      <div>
                        <p className="font-semibold text-white">
                          {donation.amount} {donation.token.symbol}
                        </p>
                        <p className="text-sm text-slate-400">
                          From {donation.donorAddress.slice(0, 6)}...{donation.donorAddress.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">{new Date(donation.timestamp).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500">{new Date(donation.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Start Stream Modal */}
      <Dialog open={showStreamModal} onOpenChange={setShowStreamModal}>
        <DialogContent className="sm:max-w-md bg-slate-900/95 backdrop-blur-xl border-slate-700 rounded-3xl">
          <DialogHeader className="text-center space-y-3">
            <DialogTitle className="text-2xl font-semibold text-white">Start Streaming</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <Input
              placeholder="Stream title (e.g., Live Folk Music)"
              value={streamForm.title}
              onChange={(e) => setStreamForm({ ...streamForm, title: e.target.value })}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
            />
            <Input
              placeholder="Description (optional)"
              value={streamForm.description}
              onChange={(e) => setStreamForm({ ...streamForm, description: e.target.value })}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
            />
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowStreamModal(false)}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartStream}
                disabled={!streamForm.title.trim()}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg"
              >
                <Video className="h-4 w-4 mr-2" />
                Go Live
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Modal */}
      <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
        <DialogContent className="sm:max-w-md bg-slate-900/95 backdrop-blur-xl border-slate-700 rounded-3xl">
          <DialogHeader className="text-center space-y-3">
            <DialogTitle className="text-2xl font-semibold text-white">Update Location & Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <Input
              placeholder="Location description"
              value={locationForm.location}
              onChange={(e) => setLocationForm({ ...locationForm, location: e.target.value })}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                step="any"
                placeholder="Latitude"
                value={locationForm.latitude}
                onChange={(e) => setLocationForm({ ...locationForm, latitude: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
              />
              <Input
                type="number"
                step="any"
                placeholder="Longitude"
                value={locationForm.longitude}
                onChange={(e) => setLocationForm({ ...locationForm, longitude: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
              />
            </div>
            <Input
              type="number"
              placeholder="Duration (minutes)"
              value={locationForm.duration}
              onChange={(e) => setLocationForm({ ...locationForm, duration: e.target.value })}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3"
            />
            <Button
              onClick={getCurrentLocation}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 rounded-xl py-3"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Use Current Location
            </Button>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowLocationModal(false)}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateLocation}
                className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl shadow-lg"
              >
                <Timer className="h-4 w-4 mr-2" />
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
