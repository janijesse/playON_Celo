"use client"
import { Music, Users, Zap, MapPin, Loader2, Search, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArtistCard } from "@/components/artist-card"
import { useStore } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function UserPage() {
  const router = useRouter()
  const getArtistsNearby = useStore((state) => state.getArtistsNearby)
  const setUserLocation = useStore((state) => state.setUserLocation)
  const userLocation = useStore((state) => state.userLocation)
  const auth = useStore((state) => state.auth)
  const logout = useStore((state) => state.logout)
  const [nearbyArtists, setNearbyArtists] = useState(getArtistsNearby())
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationInput, setLocationInput] = useState("")
  const [maxDistance, setMaxDistance] = useState(50)
  const [searchTerm, setSearchTerm] = useState("")

  // Verificar autenticación
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.currentUser) {
      router.push("/login")
      return
    }

    if (auth.currentUser.type !== "user") {
      router.push("/artist/dashboard")
      return
    }
  }, [auth, router])

  // Establecer una ubicación por defecto para mostrar artistas inmediatamente
  useEffect(() => {
    if (!userLocation) {
      // Buenos Aires como ubicación por defecto
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
            address: "Tu ubicación actual",
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

  const setManualLocation = () => {
    const coords = locationInput.split(",").map((coord) => Number.parseFloat(coord.trim()))
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      setUserLocation({
        latitude: coords[0],
        longitude: coords[1],
        address: locationInput,
      })
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

  if (!auth.isAuthenticated || !auth.currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-3">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Hola, {auth.currentUser.name}
                </h1>
                <p className="text-purple-200">Descubre artistas increíbles cerca de ti</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-white/30 bg-white/10 hover:bg-white/20 text-white hover:text-white backdrop-blur-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                <Input
                  placeholder="Buscar artistas o ubicaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400 backdrop-blur-sm"
                />
              </div>
            </div>
            <Button
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              variant="outline"
              className="border-white/30 bg-white/10 hover:bg-white/20 text-white hover:text-white backdrop-blur-sm"
            >
              {isGettingLocation ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4 mr-2" />
              )}
              Mi ubicación
            </Button>
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-50"></div>
                    <MapPin className="relative h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">Tu ubicación</h2>
                    {userLocation && <p className="text-green-400 text-sm">📍 {userLocation.address}</p>}
                  </div>
                </div>

                <div className="flex gap-3 flex-grow">
                  <div className="flex gap-2 flex-grow">
                    <Input
                      placeholder="Lat, Lon (ej: -34.6037, -58.3816)"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400"
                    />
                    <Button
                      onClick={setManualLocation}
                      variant="outline"
                      className="border-white/30 bg-white/10 hover:bg-white/20 text-white hover:text-white"
                    >
                      Establecer
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Label htmlFor="distance" className="text-white whitespace-nowrap">
                    Radio:
                  </Label>
                  <select
                    id="distance"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-purple-400 backdrop-blur-sm"
                  >
                    <option value={5} className="bg-gray-800">
                      5 km
                    </option>
                    <option value={10} className="bg-gray-800">
                      10 km
                    </option>
                    <option value={25} className="bg-gray-800">
                      25 km
                    </option>
                    <option value={50} className="bg-gray-800">
                      50 km
                    </option>
                    <option value={100} className="bg-gray-800">
                      100 km
                    </option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-8 text-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 bg-red-500 rounded-full blur-sm opacity-50"></div>
              </div>
              <span className="text-white font-medium">{filteredArtists.length} artistas cerca</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-purple-200">Donaciones instantáneas</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              <span className="text-purple-200">Comunidad global</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Artistas */}
      <main className="container mx-auto px-4 py-12">
        {filteredArtists.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-16 max-w-md mx-auto border border-white/20">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                  <Music className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No hay artistas cerca</h3>
              <p className="text-purple-200 mb-8">Intenta ampliar el radio de búsqueda o cambia tu ubicación</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
