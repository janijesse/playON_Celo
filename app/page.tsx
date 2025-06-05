"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Music, MapPin, Loader2, Search, Wallet, Zap, ExternalLink, Users, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArtistCard } from "@/components/artist-card"
import { useStore } from "@/lib/store"
import { connectWallet, isMetaMaskInstalled } from "@/lib/web3"
import { WalletAuthModal } from "@/components/wallet-auth-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()
  const auth = useStore((state) => state.auth)
  const getArtistsNearby = useStore((state) => state.getArtistsNearby)
  const setUserLocation = useStore((state) => state.setUserLocation)
  const userLocation = useStore((state) => state.userLocation)

  const [nearbyArtists, setNearbyArtists] = useState(getArtistsNearby())
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [maxDistance, setMaxDistance] = useState(50)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletError, setWalletError] = useState("")

  useEffect(() => {
    if (auth.isAuthenticated && auth.currentUser) {
      if (auth.currentUser.type === "artist") {
        router.push("/artist/dashboard")
      } else {
        router.push("/user/dashboard")
      }
    }
  }, [auth, router])

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

  const handleConnectWallet = async () => {
    setWalletError("")

    if (!isMetaMaskInstalled()) {
      setWalletError("MetaMask is not installed. Please install MetaMask to continue.")
      return
    }

    setIsConnecting(true)
    try {
      const walletAddress = await connectWallet()
      const user = await useStore.getState().loginWithWallet(walletAddress)

      if (user) {
        if (user.type === "artist") {
          router.push("/artist/dashboard")
        } else {
          router.push("/user/dashboard")
        }
      } else {
        setShowAuthModal(true)
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      setWalletError(error.message || "Failed to connect wallet")

      // If the error is about rejection, provide more helpful guidance
      if (error.message?.includes("rejected") || error.message?.includes("approve")) {
        setWalletError("Connection rejected. Please approve the MetaMask connection request to continue.")
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const filteredArtists = nearbyArtists.filter(
    (artist) =>
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Music className="h-5 w-5 text-white" />
              </div>
            
            </div>

            <div className="flex items-center space-x-4">
              {!auth.isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={handleConnectWallet}
                    disabled={isConnecting}
                    className="bg-white text-slate-900 hover:bg-slate-100 font-medium px-6 rounded-xl shadow-lg"
                  >
                    {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                    <span className="ml-2">Connect Wallet</span>
                  </Button>
                  {!isMetaMaskInstalled() && (
                    <a
                     
                    >
                     
                      
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-white/10 rounded-xl px-4 py-2">
                    {auth.currentUser?.type === "artist" ? (
                      <Badge className="bg-violet-500 text-white">🎭 Artist</Badge>
                    ) : (
                      <Badge className="bg-blue-500 text-white">👤 Fan</Badge>
                    )}
                    <span className="text-white text-sm">{auth.currentUser?.name}</span>
                  </div>
                  <Button
                    onClick={() => {
                      if (auth.currentUser?.type === "artist") {
                        router.push("/artist/dashboard")
                      } else {
                        router.push("/user/dashboard")
                      }
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 px-6 rounded-xl shadow-lg"
                  >
                    Dashboard
                  </Button>
                  <Button
                    onClick={() => {
                      useStore.getState().logout()
                      window.location.reload()
                    }}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 rounded-xl"
                  >
                    Disconnect
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Wallet Error Alert */}
      {walletError && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <Alert className="bg-red-500/10 border-red-500/20 rounded-xl">
            <AlertDescription className="text-red-400 flex items-center justify-between">
              <span>{walletError}</span>
              {walletError.includes("MetaMask is not installed") && (
                <a
                 
                >
                  <span>Install MetaMask</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {walletError && walletError.includes("MetaMask is not installed") && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Wallet className="h-5 w-5" />
                <span>How to Install MetaMask</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300">
                MetaMask is a digital wallet that allows you to interact with the Ethereum blockchain. Follow these
                steps to install it:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-slate-300">
                <li>
                  Visit{" "}
                  <a
                    
                  >
                    metamask.io/download
                  </a>
                </li>
                <li>Click "Install MetaMask for Chrome" (or your browser)</li>
                <li>Follow the installation instructions</li>
                <li>Create a new wallet or import an existing one</li>
                <li>Return to this page and click "Connect Wallet"</li>
              </ol>
              <div className="pt-4">
                <a
                 
                >
                  <span>Install MetaMask</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            playON
            <span className="block text-transparent bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text">
              
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Discover talented street artists near you and support them instantly with cryptocurrency donations
          </p>

          {!auth.isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
             
              
            </div>
          )}
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search artists or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-2xl backdrop-blur-sm focus:bg-white/15 transition-all"
            />
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 rounded-xl px-4"
            >
              {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              <span className="ml-2">My Location</span>
            </Button>

            <select
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={5}>5km radius</option>
              <option value={25}>25km radius</option>
              <option value={50}>50km radius</option>
              <option value={100}>100km radius</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex items-center justify-center space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">{filteredArtists.length} artists live</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-slate-300">Instant crypto tips</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-400" />
            <span className="text-slate-300">Global community</span>
          </div>
        </div>
      </div>

      {/* Artists Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-16">
        {filteredArtists.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 opacity-60">
              <Music className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No artists nearby</h3>
            <p className="text-slate-400">Try expanding your search radius or check back later</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </main>

      <WalletAuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}
