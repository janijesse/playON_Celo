"use client"

import { useState, useEffect } from "react"
import { Wallet, Loader2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Artist, Token } from "@/lib/types"
import { connectWallet, sendTokenDonation, getWalletAddress, isMetaMaskInstalled } from "@/lib/web3"
import { useStore } from "@/lib/store"
import { MetaMaskGuide } from "@/components/metamask-guide"

interface DonationModalProps {
  artist: Artist
  isOpen: boolean
  onClose: () => void
}

export function DonationModal({ artist, isOpen, onClose }: DonationModalProps) {
  const auth = useStore((state) => state.auth)
  const addDonation = useStore((state) => state.addDonation)
  const tokens = useStore((state) => state.getTokens())
  const loginWithWallet = useStore((state) => state.loginWithWallet)
  const registerWithWallet = useStore((state) => state.registerWithWallet)

  const [amount, setAmount] = useState("")
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isSending, setIsSending] = useState(false) // Declare isSending variable

  const quickAmounts = ["0.001", "0.01", "0.1", "1"]

  useEffect(() => {
    if (isOpen) {
      getWalletAddress().then((address) => {
        setWalletAddress(address)
        if (address && !selectedToken) {
          setSelectedToken(tokens[0])
        }
      })
    }
  }, [isOpen, tokens, selectedToken])

  const handleConnectWallet = async () => {
    setError("")

    if (!isMetaMaskInstalled()) {
      setError("MetaMask is not installed. Please install MetaMask to continue.")
      return
    }

    setIsConnecting(true)
    try {
      const address = await connectWallet()
      setWalletAddress(address)

      const user = await loginWithWallet(address)
      if (!user) {
        await registerWithWallet(address, "user", "User")
      }

      if (!selectedToken) {
        setSelectedToken(tokens[0])
      }
    } catch (err: any) {
      console.error("Error connecting wallet:", err)

      // If the error is about rejection, provide more helpful guidance
      if (err.message?.includes("rejected") || err.message?.includes("approve")) {
        setError("Connection rejected. Please approve the MetaMask connection request to continue.")
      } else {
        setError(err.message || "Failed to connect wallet")
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSendDonation = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Enter a valid amount")
      return
    }

    if (!selectedToken) {
      setError("Select a token")
      return
    }

    setIsSending(true)
    setError("")
    try {
      const { txHash, fromAddress } = await sendTokenDonation(artist.walletAddress, amount, selectedToken)

      addDonation({
        artistId: artist.id,
        amount,
        token: selectedToken,
        txHash,
        donorAddress: fromAddress,
      })

      setSuccess(true)
      setAmount("")
    } catch (err: any) {
      console.error("Error sending donation:", err)

      // If the error is about rejection, provide more helpful guidance
      if (err.message?.includes("rejected") || err.message?.includes("approve")) {
        setError("Transaction was rejected. Please approve the transaction in MetaMask to send your tip.")
      } else {
        setError(err.message || "Transaction failed")
      }
    } finally {
      setIsSending(false)
    }
  }

  const handleClose = () => {
    setAmount("")
    setError("")
    setSuccess(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-slate-900/95 backdrop-blur-xl border-slate-700 rounded-3xl">
        <DialogHeader className="text-center space-y-3">
          <DialogTitle className="text-2xl font-semibold text-white">Tip {artist.name}</DialogTitle>
          <DialogDescription className="text-slate-400">Support this amazing artist with crypto</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {!walletAddress ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/25">
                <Wallet className="h-10 w-10 text-white" />
              </div>

              {!isMetaMaskInstalled() && (
                <div className="mb-6">
                  <MetaMaskGuide />
                </div>
              )}

              {isMetaMaskInstalled() ? (
                <Button
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold py-3 rounded-xl shadow-lg"
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wallet className="h-4 w-4 mr-2" />
                  )}
                  Connect Wallet
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              {/* Token Selection */}
              <div className="space-y-3">
                <label className="text-white font-medium text-sm">Choose Token</label>
                <div className="grid grid-cols-4 gap-3">
                  {tokens.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => setSelectedToken(token)}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                        selectedToken?.symbol === token.symbol
                          ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20"
                          : "border-slate-600 bg-slate-800/50 hover:bg-slate-800"
                      }`}
                    >
                      <div className="text-2xl mb-2">{token.icon}</div>
                      <div className="text-white text-xs font-semibold">{token.symbol}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Amounts */}
              <div className="space-y-3">
                <label className="text-white font-medium text-sm">Quick Amount</label>
                <div className="grid grid-cols-4 gap-3">
                  {quickAmounts.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount)}
                      className={`p-3 rounded-xl border transition-all duration-300 ${
                        amount === quickAmount
                          ? "border-violet-500 bg-violet-500/10 text-white"
                          : "border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div className="text-sm font-semibold">{quickAmount}</div>
                      <div className="text-xs opacity-75">{selectedToken?.symbol}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="space-y-3">
                <label className="text-white font-medium text-sm">Custom Amount</label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pr-16 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 rounded-xl text-center text-lg py-4 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                    {selectedToken?.symbol}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSendDonation}
                disabled={isSending || !amount || !selectedToken}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold py-4 rounded-xl shadow-lg"
              >
                {isSending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Wallet className="h-5 w-5 mr-2" />}
                Send Tip
              </Button>
            </>
          )}

          {error && (
            <Alert variant="destructive" className="rounded-xl bg-red-500/10 border-red-500/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-400 flex items-center justify-between">
                <span>{error}</span>
                {error.includes("MetaMask is not installed") && (
                  <a
                   
                  >
                    <span>Install</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="rounded-xl bg-green-500/10 border-green-500/20">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-400">
                Tip sent successfully! Thank you for supporting the artist!
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
