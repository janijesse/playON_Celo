export interface Artist {
  id: string
  name: string
  location: string
  latitude: number
  longitude: number
  duration: number // en minutos
  walletAddress: string
  createdAt: Date
  isActive: boolean
  userId: string // Vinculado al usuario
  // Stream data
  streamId?: string // ID único del stream
  streamTitle?: string
  streamDescription?: string
  viewerCount?: number
}

export interface Token {
  symbol: string
  name: string
  address: string
  decimals: number
  icon: string
}

export interface Donation {
  id: string
  artistId: string
  amount: string
  token: Token
  txHash: string
  donorAddress: string
  timestamp: Date
}

export interface UserLocation {
  latitude: number
  longitude: number
  address?: string
}

export interface ArtistWithDistance extends Artist {
  distance?: number // en kilómetros
}

export type UserType = "user" | "artist"

export interface User {
  id: string
  walletAddress: string
  type: UserType
  name: string
  createdAt: Date
  isActive: boolean
  // Datos específicos del artista si aplica
  artistProfile?: {
    artisticName: string
    bio?: string
    genres?: string[]
  }
}

export interface AuthState {
  isAuthenticated: boolean
  currentUser: User | null
  isLoading: boolean
}

export interface StreamData {
  id: string
  artistId: string
  title: string
  description?: string
  isLive: boolean
  viewerCount: number
  startedAt: Date
  thumbnailUrl?: string
  // Simulated stream URL for demo
  demoVideoUrl?: string
}
