"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, User, Palette } from "lucide-react"
import { useStore } from "@/lib/store"
import { getWalletAddress, isMetaMaskInstalled, connectWallet } from "@/lib/web3"
import type { UserType } from "@/lib/types"

// Import and use the MetaMask guide component
import { MetaMaskGuide } from "@/components/metamask-guide"

interface WalletAuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletAuthModal({ isOpen, onClose }: WalletAuthModalProps) {
  const router = useRouter()
  const registerWithWallet = useStore((state) => state.registerWithWallet)

  const [userType, setUserType] = useState<UserType>("user")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRegister = async () => {
    if (!name.trim()) {
      setError("Please enter a name")
      return
    }

    if (!isMetaMaskInstalled()) {
      setError("MetaMask is not installed. Please install MetaMask to continue.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const walletAddress = await getWalletAddress()

      if (!walletAddress) {
        try {
          // Try to connect if not already connected
          const address = await connectWallet()
          if (address) {
            const user = await registerWithWallet(address, userType, name)

            if (user.type === "artist") {
              router.push("/artist/setup")
            } else {
              router.push("/user/dashboard")
            }
            onClose()
            return
          }
        } catch (connectError: any) {
          console.error("Error connecting wallet:", connectError)
          setError(connectError.message || "Failed to connect wallet")

          // If the error is about rejection, provide more helpful guidance
          if (connectError.message?.includes("rejected") || connectError.message?.includes("approve")) {
            setError("Connection rejected. Please approve the MetaMask connection request to continue.")
          }
          return
        }
      }

      const user = await registerWithWallet(walletAddress, userType, name)

      if (user.type === "artist") {
        router.push("/artist/setup")
      } else {
        router.push("/user/dashboard")
      }
      onClose()
    } catch (err: any) {
      console.error("Error registering with wallet:", err)
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900/95 backdrop-blur-xl border-slate-700 rounded-3xl">
        <DialogHeader className="text-center space-y-3">
          <DialogTitle className="text-2xl font-semibold text-white">Welcome to PlayON</DialogTitle>
          <DialogDescription className="text-slate-400">Complete your profile to get started</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {!isMetaMaskInstalled() && (
            <div className="mb-6">
              <MetaMaskGuide />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-white font-medium">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name or artist name"
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 rounded-xl py-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-white font-medium">I want to join as...</Label>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => setUserType("user")}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  userType === "user"
                    ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                    : "border-slate-600 bg-slate-800/50 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <User className="h-8 w-8 text-white" />
                  <div className="text-left">
                    <p className="text-white font-semibold text-lg">Fan / Supporter</p>
                    <p className="text-slate-400 text-sm">Discover artists, watch streams, and send crypto tips</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setUserType("artist")}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  userType === "artist"
                    ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20"
                    : "border-slate-600 bg-slate-800/50 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Palette className="h-8 w-8 text-white" />
                  <div className="text-left">
                    <p className="text-white font-semibold text-lg">Artist</p>
                    <p className="text-slate-400 text-sm">Stream your performances and earn crypto tips</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-xl p-3">{error}</p>}

          <Button
            onClick={handleRegister}
            disabled={isLoading || !name.trim() || !isMetaMaskInstalled()}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl py-3 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : userType === "artist" ? (
              <Palette className="h-4 w-4 mr-2" />
            ) : (
              <User className="h-4 w-4 mr-2" />
            )}
            {userType === "artist" ? "Start Performing" : "Start Exploring"}
          </Button>

          <div className="text-center">
            <p className="text-slate-400 text-xs">
              By joining, you agree to connect your wallet and participate in the Street Artists community
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
