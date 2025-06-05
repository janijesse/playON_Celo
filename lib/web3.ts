"use client"

declare global {
  interface Window {
    ethereum?: any
  }
}

import type { Token } from "./types"

export const isMetaMaskInstalled = () => {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined"
}

// Improve the error handling in connectWallet function
export const connectWallet = async () => {
  if (typeof window === "undefined") {
    throw new Error("Please use a web browser to connect your wallet")
  }

  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please make sure MetaMask is unlocked.")
    }

    return accounts[0]
  } catch (error: any) {
    console.error("Error connecting wallet:", error)

    // Handle specific MetaMask error codes
    if (error.code === 4001) {
      throw new Error("Connection rejected. Please approve the MetaMask connection request to continue.")
    } else if (error.code === -32002) {
      throw new Error("MetaMask connection request already pending. Please check your MetaMask extension.")
    } else if (error.code === -32603) {
      throw new Error("MetaMask encountered an internal error. Please try again.")
    }

    throw new Error(error.message || "Failed to connect wallet. Please try again.")
  }
}

// Also improve the sendDonation and sendTokenDonation functions
export const sendDonation = async (toAddress: string, amount: string) => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed")
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    })

    if (accounts.length === 0) {
      // Try to connect if not already connected
      try {
        const newAccounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })
        if (newAccounts && newAccounts.length > 0) {
          accounts[0] = newAccounts[0]
        } else {
          throw new Error("No wallet connected. Please connect your wallet first.")
        }
      } catch (connectError: any) {
        if (connectError.code === 4001) {
          throw new Error("Connection rejected. Please approve the MetaMask connection request.")
        }
        throw connectError
      }
    }

    const amountInWei = (Number.parseFloat(amount) * 1e18).toString(16)

    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: accounts[0],
          to: toAddress,
          value: "0x" + amountInWei,
        },
      ],
    })

    return { txHash, fromAddress: accounts[0] }
  } catch (error: any) {
    console.error("Error sending donation:", error)
    if (error.code === 4001) {
      throw new Error("Transaction was rejected. Please approve the transaction in MetaMask to send your tip.")
    }
    throw new Error(error.message || "Transaction failed. Please try again.")
  }
}

export const sendTokenDonation = async (toAddress: string, amount: string, token: Token) => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed")
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    })

    if (accounts.length === 0) {
      // Try to connect if not already connected
      try {
        const newAccounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })
        if (newAccounts && newAccounts.length > 0) {
          accounts[0] = newAccounts[0]
        } else {
          throw new Error("No wallet connected. Please connect your wallet first.")
        }
      } catch (connectError: any) {
        if (connectError.code === 4001) {
          throw new Error("Connection rejected. Please approve the MetaMask connection request.")
        }
        throw connectError
      }
    }

    // Si es ETH nativo
    if (token.address === "0x0000000000000000000000000000000000000000") {
      return await sendDonation(toAddress, amount)
    }

    // Para tokens ERC-20
    const amountInWei = (Number.parseFloat(amount) * Math.pow(10, token.decimals)).toString(16)

    // ABI mínimo para transfer de ERC-20
    const transferData =
      "0xa9059cbb" + // transfer function selector
      toAddress.slice(2).padStart(64, "0") + // to address
      amountInWei.padStart(64, "0") // amount

    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: accounts[0],
          to: token.address,
          data: transferData,
        },
      ],
    })

    return { txHash, fromAddress: accounts[0] }
  } catch (error: any) {
    console.error("Error sending token donation:", error)
    if (error.code === 4001) {
      throw new Error("Transaction was rejected. Please approve the transaction in MetaMask to send your tip.")
    }
    throw new Error(error.message || "Transaction failed. Please try again.")
  }
}

export const getWalletAddress = async () => {
  if (!isMetaMaskInstalled()) {
    return null
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    })
    return accounts[0] || null
  } catch (error) {
    console.error("Error getting wallet address:", error)
    return null
  }
}

export const getTokenBalance = async (tokenAddress: string, walletAddress: string) => {
  if (!isMetaMaskInstalled()) {
    return "0.00"
  }

  try {
    // Para ETH nativo
    if (tokenAddress === "0x0000000000000000000000000000000000000000") {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [walletAddress, "latest"],
      })
      return (Number.parseInt(balance, 16) / 1e18).toFixed(4)
    }

    // Para tokens ERC-20 (implementación básica)
    return "0.00" // Placeholder - requiere más implementación
  } catch (error) {
    console.error("Error getting token balance:", error)
    return "0.00"
  }
}
