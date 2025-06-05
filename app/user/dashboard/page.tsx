"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Music, Users, Zap, MapPin, Loader2, Search, LogOut, Heart, DollarSign, Home, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArtistCard } from "@/components/artist-card"
import { useStore } from "@/lib/store"

export default function UserDashboard() {
  const router = useRouter()
  const auth = useStore((state) => state.auth)
  const getArtistsNearby = useStore((state) => state.getArtistsNearby)
  const setUserLocation = useStore((state) => state.setUserLocation)
  const userLocation = useStore((state) => state.userLocation)
  const donations = useStore((state) => state.donations)
  const logout = useStore((state) => state.logout)

  const [nearbyArtists, setNearbyArtists] = useState(getArtistsNearby())
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [maxDistance, setMaxDistance] = useState(50)
  const [searchTerm, setSearchTerm] = useState("")

  // Verificar autenticación
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.currentUser) {
      router.push("/")
      return
    }

    if (auth.currentUser.type !== "user") {
      router.push("/artist/dashboard")
      return
    }
  }, [auth, router])

  // Establecer ubicación por defecto
  useEffect(() => {
    if (!userLocation) {
      setUserLocation({
        latitude: -34.6037,
        longitude: -58.3816,
        address: "Buenos Aires, Argentina",
      })
    }
  }, [userLocation, setUserLocation])

  useEffect(() => {
    setNearbyArtists(getArtistsNearby(maxDistance))
  }, [userLocation, maxDistance, getArtistsNearby])

  const getCurrentLocation = () => {
    setIsGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: "Your current location",
          })
          setIsGettingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsGettingLocation(false)
        },
      )
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const filteredArtists = nearbyArtists.filter(
    (artist) =>
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calcular estadísticas del usuario
  const userDonations = auth.currentUser
    ? donations.filter((d) => d.donorAddress === auth.currentUser?.walletAddress)
    : []
  const totalDonated = userDonations.reduce((sum, donation) => {
    try {
      return sum + Number.parseFloat(donation.amount)
    } catch (err) {
      return sum
    }
  }, 0)
  const artistsSupported = new Set(userDonations.map((d) => d.artistId)).size

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Welcome back, {auth.currentUser.name}!</h1>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-blue-500 text-white text-xs font-medium">👤 Fan</Badge>
                  <span className="text-slate-400 text-sm">Discover amazing street artists</span>
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
                onClick={handleLogout}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 rounded-xl"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{totalDonated.toFixed(3)}</p>
              <p className="text-slate-400 text-sm">ETH donated</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 text-red-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{artistsSupported}</p>
              <p className="text-slate-400 text-sm">Artists supported</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
            <CardContent className="p-6 text-center">
              <Music className="h-8 w-8 text-violet-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{filteredArtists.length}</p>
              <p className="text-slate-400 text-sm">Artists nearby</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-amber-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{userDonations.length}</p>
              <p className="text-slate-400 text-sm">Tips sent</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search artists or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400 backdrop-blur-sm rounded-xl"
                />
              </div>
            </div>
            <Button
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              variant="outline"
              className="border-white/30 bg-white/10 hover:bg-white/20 text-white hover:text-white backdrop-blur-sm rounded-xl"
            >
              {isGettingLocation ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4 mr-2" />
              )}
              My Location
            </Button>
            <select
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:border-purple-400 backdrop-blur-sm"
            >
              <option value={5} className="bg-slate-800">
                5 km
              </option>
              <option value={10} className="bg-slate-800">
                10 km
              </option>
              <option value={25} className="bg-slate-800">
                25 km
              </option>
              <option value={50} className="bg-slate-800">
                50 km
              </option>
              <option value={100} className="bg-slate-800">
                100 km
              </option>
            </select>
          </div>

          {userLocation && (
            <div className="mt-4 flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-50"></div>
                <MapPin className="relative h-5 w-5 text-blue-400" />
              </div>
              <span className="text-white text-sm">📍 {userLocation.address}</span>
            </div>
          )}
        </div>

        {/* Recent Donations */}
        {userDonations.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Recent Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {userDonations.slice(0, 5).map((donation) => (
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
                        <p className="text-sm text-slate-400">Artist ID: {donation.artistId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">{new Date(donation.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Live Artists */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Live Artists Near You</span>
            </h2>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Instant crypto tips available</span>
            </div>
          </div>

          {filteredArtists.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 opacity-60">
                <Music className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">No artists nearby</h3>
              <p className="text-slate-400 mb-6">Try expanding your search radius or check back later</p>
              <Button
                onClick={() => setMaxDistance(100)}
                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl"
              >
                Expand Search to 100km
              </Button>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
