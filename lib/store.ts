"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Artist, Donation, Token, UserLocation, ArtistWithDistance, User, AuthState, StreamData } from "./types"

const POPULAR_TOKENS: Token[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    icon: "⟠",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xA0b86a33E6441b8435b662303c0f218C8F8c0c0c",
    decimals: 6,
    icon: "💵",
  },
  {
    symbol: "USDT",
    name: "Tether",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
    icon: "💰",
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    decimals: 18,
    icon: "🟡",
  },
]

// Demo videos for simulation
const DEMO_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
]

// Función para calcular distancia usando fórmula de Haversine
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  try {
    const R = 6371 // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  } catch (error) {
    console.error("Error calculating distance:", error)
    return 0
  }
}

interface AppState {
  // Auth state
  auth: AuthState
  users: User[]

  // Existing state
  artists: Artist[]
  donations: Donation[]
  tokens: Token[]
  userLocation: UserLocation | null
  streams: StreamData[]

  // Auth methods - Solo wallet
  loginWithWallet: (walletAddress: string) => Promise<User | null>
  registerWithWallet: (walletAddress: string, type: "user" | "artist", name?: string) => Promise<User>
  logout: () => void
  getCurrentUser: () => User | null

  // Stream methods
  startStream: (artistId: string, title: string, description?: string) => string
  stopStream: (streamId: string) => void
  getStreamByArtistId: (artistId: string) => StreamData | undefined
  updateViewerCount: (streamId: string, count: number) => void

  // Artist methods
  addArtist: (artist: Omit<Artist, "id" | "createdAt">) => string
  createArtistProfile: (userId: string, artistData: Partial<Artist>) => string
  addDonation: (donation: Omit<Donation, "id" | "timestamp">) => void
  getActiveArtists: () => Artist[]
  updateArtistStatus: (artistId: string, isActive: boolean) => void
  getTokens: () => Token[]
  setUserLocation: (location: UserLocation) => void
  getArtistsNearby: (maxDistance?: number) => ArtistWithDistance[]
  getArtistById: (id: string) => Artist | undefined
  updateArtist: (id: string, updates: Partial<Artist>) => void
  getDonationsForArtist: (artistId: string) => Donation[]
  getUserArtistProfile: (userId: string) => Artist | undefined
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth state
      auth: {
        isAuthenticated: false,
        currentUser: null,
        isLoading: false,
      },
      users: [
        // Usuarios de ejemplo
        {
          id: "user1",
          walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590c4",
          type: "artist",
          name: "Carlos Guitarra",
          createdAt: new Date(),
          isActive: true,
          artistProfile: {
            artisticName: "Carlos Guitarra",
            bio: "Músico callejero con 10 años de experiencia",
            genres: ["Rock", "Blues", "Folk"],
          },
        },
        {
          id: "user2",
          walletAddress: "0x8ba1f109551bD432803012645Hac136c0532925",
          type: "artist",
          name: "María Violín",
          createdAt: new Date(),
          isActive: true,
          artistProfile: {
            artisticName: "María Violín",
            bio: "Violinista clásica y contemporánea",
            genres: ["Clásica", "Contemporánea", "Tango"],
          },
        },
        {
          id: "user3",
          walletAddress: "0x123456789abcdef123456789abcdef123456789a",
          type: "user",
          name: "Juan Pérez",
          createdAt: new Date(),
          isActive: true,
        },
      ],

      artists: [
        {
          id: "1",
          name: "Carlos Guitarra",
          location: "Plaza San Martín, Buenos Aires",
          latitude: -34.6037,
          longitude: -58.3816,
          duration: 120,
          walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590c4",
          createdAt: new Date(),
          isActive: true,
          userId: "user1",
          streamId: "stream1",
          streamTitle: "Música Folk en Vivo",
          streamDescription: "Sesión acústica en la plaza",
          viewerCount: 23,
        },
        {
          id: "2",
          name: "María Violín",
          location: "Parque Retiro, Buenos Aires",
          latitude: -34.5922,
          longitude: -58.3756,
          duration: 90,
          walletAddress: "0x8ba1f109551bD432803012645Hac136c0532925",
          createdAt: new Date(),
          isActive: true,
          userId: "user2",
          streamId: "stream2",
          streamTitle: "Clásicos del Violín",
          streamDescription: "Interpretaciones clásicas y contemporáneas",
          viewerCount: 45,
        },
      ],
      donations: [],
      tokens: POPULAR_TOKENS,
      userLocation: null,
      streams: [
        {
          id: "stream1",
          artistId: "1",
          title: "Música Folk en Vivo",
          description: "Sesión acústica en la plaza",
          isLive: true,
          viewerCount: 23,
          startedAt: new Date(),
          thumbnailUrl: "/placeholder.svg?height=400&width=600",
          demoVideoUrl: DEMO_VIDEOS[0],
        },
        {
          id: "stream2",
          artistId: "2",
          title: "Clásicos del Violín",
          description: "Interpretaciones clásicas y contemporáneas",
          isLive: true,
          viewerCount: 45,
          startedAt: new Date(),
          thumbnailUrl: "/placeholder.svg?height=400&width=600",
          demoVideoUrl: DEMO_VIDEOS[1],
        },
      ],

      // Auth methods - Solo wallet
      loginWithWallet: async (walletAddress: string) => {
        try {
          set((state) => ({
            auth: { ...state.auth, isLoading: true },
          }))

          // Simular delay de autenticación
          await new Promise((resolve) => setTimeout(resolve, 1000))

          const user = get().users.find((u) => u.walletAddress === walletAddress)
          if (user) {
            set((state) => ({
              auth: {
                isAuthenticated: true,
                currentUser: user,
                isLoading: false,
              },
            }))
            return user
          } else {
            set((state) => ({
              auth: { ...state.auth, isLoading: false },
            }))
            return null
          }
        } catch (error) {
          set((state) => ({
            auth: { ...state.auth, isLoading: false },
          }))
          return null
        }
      },

      registerWithWallet: async (walletAddress: string, type: "user" | "artist", name = "Usuario") => {
        try {
          const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            walletAddress,
            type,
            name,
            createdAt: new Date(),
            isActive: true,
            ...(type === "artist" && {
              artistProfile: {
                artisticName: name,
                bio: "",
                genres: [],
              },
            }),
          }

          set((state) => ({
            users: [...state.users, newUser],
            auth: {
              isAuthenticated: true,
              currentUser: newUser,
              isLoading: false,
            },
          }))

          return newUser
        } catch (error) {
          throw error
        }
      },

      logout: () => {
        set((state) => ({
          auth: {
            isAuthenticated: false,
            currentUser: null,
            isLoading: false,
          },
        }))
      },

      getCurrentUser: () => {
        return get().auth.currentUser
      },

      // Stream methods
      startStream: (artistId: string, title: string, description?: string) => {
        const streamId = Math.random().toString(36).substr(2, 9)
        const newStream: StreamData = {
          id: streamId,
          artistId,
          title,
          description,
          isLive: true,
          viewerCount: Math.floor(Math.random() * 50) + 1, // Simular viewers
          startedAt: new Date(),
          thumbnailUrl: "/placeholder.svg?height=400&width=600",
          demoVideoUrl: DEMO_VIDEOS[Math.floor(Math.random() * DEMO_VIDEOS.length)],
        }

        set((state) => ({
          streams: [...state.streams, newStream],
          artists: state.artists.map((artist) =>
            artist.id === artistId
              ? {
                  ...artist,
                  isActive: true,
                  streamId,
                  streamTitle: title,
                  streamDescription: description,
                  viewerCount: newStream.viewerCount,
                  createdAt: new Date(), // Reset timer
                }
              : artist,
          ),
        }))

        return streamId
      },

      stopStream: (streamId: string) => {
        const stream = get().streams.find((s) => s.id === streamId)
        if (stream) {
          set((state) => ({
            streams: state.streams.map((s) => (s.id === streamId ? { ...s, isLive: false } : s)),
            artists: state.artists.map((artist) =>
              artist.streamId === streamId
                ? {
                    ...artist,
                    isActive: false,
                    streamId: undefined,
                    streamTitle: undefined,
                    streamDescription: undefined,
                    viewerCount: 0,
                  }
                : artist,
            ),
          }))
        }
      },

      getStreamByArtistId: (artistId: string) => {
        return get().streams.find((stream) => stream.artistId === artistId && stream.isLive)
      },

      updateViewerCount: (streamId: string, count: number) => {
        set((state) => ({
          streams: state.streams.map((stream) => (stream.id === streamId ? { ...stream, viewerCount: count } : stream)),
          artists: state.artists.map((artist) =>
            artist.streamId === streamId ? { ...artist, viewerCount: count } : artist,
          ),
        }))
      },

      createArtistProfile: (userId: string, artistData: Partial<Artist>) => {
        const user = get().users.find((u) => u.id === userId)
        if (!user) throw new Error("User not found")

        const newArtist: Artist = {
          id: Math.random().toString(36).substr(2, 9),
          name: artistData.name || user.name,
          location: artistData.location || "Location not set",
          latitude: artistData.latitude || -34.6037,
          longitude: artistData.longitude || -58.3816,
          duration: artistData.duration || 120,
          walletAddress: user.walletAddress,
          createdAt: new Date(),
          isActive: false,
          userId: userId,
          ...artistData,
        }

        set((state) => ({
          artists: [...state.artists, newArtist],
        }))

        return newArtist.id
      },

      getUserArtistProfile: (userId: string) => {
        const { artists } = get()
        return artists.find((artist) => artist.userId === userId)
      },

      setUserLocation: (location) => set({ userLocation: location }),

      getArtistById: (id) => {
        try {
          const { artists } = get()
          return artists.find((artist) => artist.id === id)
        } catch (error) {
          console.error("Error getting artist by ID:", error)
          return undefined
        }
      },

      updateArtist: (id, updates) =>
        set((state) => ({
          artists: state.artists.map((artist) => (artist.id === id ? { ...artist, ...updates } : artist)),
        })),

      getDonationsForArtist: (artistId) => {
        try {
          const { donations } = get()
          return donations.filter((donation) => donation.artistId === artistId)
        } catch (error) {
          console.error("Error getting donations for artist:", error)
          return []
        }
      },

      getArtistsNearby: (maxDistance = 50) => {
        try {
          const { artists, userLocation } = get()
          const activeArtists = artists.filter((artist) => {
            try {
              const now = new Date()
              const createdAt = new Date(artist.createdAt)
              const endTime = new Date(createdAt.getTime() + artist.duration * 60000)
              return artist.isActive && now < endTime
            } catch (error) {
              console.error("Error checking artist active status:", error)
              return false
            }
          })

          if (!userLocation) {
            return activeArtists.map((artist) => ({ ...artist, distance: undefined }))
          }

          return activeArtists
            .map((artist) => ({
              ...artist,
              distance: calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                artist.latitude,
                artist.longitude,
              ),
            }))
            .filter((artist) => (artist.distance || 0) <= maxDistance)
            .sort((a, b) => (a.distance || 0) - (b.distance || 0))
        } catch (error) {
          console.error("Error getting nearby artists:", error)
          return []
        }
      },

      addArtist: (artistData) => {
        try {
          const newArtist = {
            ...artistData,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
          }

          set((state) => ({
            artists: [...state.artists, newArtist],
          }))

          return newArtist.id
        } catch (error) {
          console.error("Error adding artist:", error)
          throw error
        }
      },

      addDonation: (donationData) => {
        try {
          set((state) => ({
            donations: [
              ...state.donations,
              {
                ...donationData,
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date(),
              },
            ],
          }))
        } catch (error) {
          console.error("Error adding donation:", error)
        }
      },

      getActiveArtists: () => {
        try {
          const { artists } = get()
          return artists.filter((artist) => {
            try {
              const now = new Date()
              const createdAt = new Date(artist.createdAt)
              const endTime = new Date(createdAt.getTime() + artist.duration * 60000)
              return artist.isActive && now < endTime
            } catch (error) {
              console.error("Error checking artist active status:", error)
              return false
            }
          })
        } catch (error) {
          console.error("Error getting active artists:", error)
          return []
        }
      },

      updateArtistStatus: (artistId, isActive) => {
        try {
          const artist = get().artists.find((a) => a.id === artistId)
          if (artist) {
            if (isActive) {
              // Start stream
              const streamId = get().startStream(artistId, artist.streamTitle || `${artist.name} en vivo`)
            } else {
              // Stop stream
              if (artist.streamId) {
                get().stopStream(artist.streamId)
              }
            }
          }
        } catch (error) {
          console.error("Error updating artist status:", error)
        }
      },

      getTokens: () => get().tokens,
    }),
    {
      name: "street-artists-storage",
      partialize: (state) => {
        try {
          return {
            auth: state.auth,
            users: state.users.map((user) => ({
              ...user,
              createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
            })),
            artists: state.artists.map((artist) => ({
              ...artist,
              createdAt: artist.createdAt instanceof Date ? artist.createdAt.toISOString() : artist.createdAt,
            })),
            donations: state.donations.map((donation) => ({
              ...donation,
              timestamp: donation.timestamp instanceof Date ? donation.timestamp.toISOString() : donation.timestamp,
            })),
            streams: state.streams.map((stream) => ({
              ...stream,
              startedAt: stream.startedAt instanceof Date ? stream.startedAt.toISOString() : stream.startedAt,
            })),
            userLocation: state.userLocation,
          }
        } catch (error) {
          console.error("Error serializing state:", error)
          return state
        }
      },
      onRehydrateStorage: () => (state) => {
        try {
          if (state) {
            // Convert ISO strings back to Date objects
            state.users = state.users.map((user) => ({
              ...user,
              createdAt: typeof user.createdAt === "string" ? new Date(user.createdAt) : user.createdAt,
            }))
            state.artists = state.artists.map((artist) => ({
              ...artist,
              createdAt: typeof artist.createdAt === "string" ? new Date(artist.createdAt) : artist.createdAt,
            }))
            state.donations = state.donations.map((donation) => ({
              ...donation,
              timestamp: typeof donation.timestamp === "string" ? new Date(donation.timestamp) : donation.timestamp,
            }))
            if (state.streams) {
              state.streams = state.streams.map((stream) => ({
                ...stream,
                startedAt: typeof stream.startedAt === "string" ? new Date(stream.startedAt) : stream.startedAt,
              }))
            }
          }
        } catch (error) {
          console.error("Error rehydrating state:", error)
        }
      },
    },
  ),
)
