'use client'

import { useContractKit } from '@celo-tools/use-contractkit'
import { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'

const CUSD_ADDRESS = '0x765DE816845861e75A25fCA122bb6898B8B1282a' // Mainnet cUSD

export default function SendCUSD() {
  const { address, kit, connect } = useContractKit()
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState<string>('')

  useEffect(() => {
    const fetchBalance = async () => {
      if (address) {
        const stableToken = await kit.contracts.getStableToken()
        const value = await stableToken.balanceOf(address)
        setBalance(kit.web3.utils.fromWei(value.toString()))
      }
    }
    fetchBalance()
  }, [address, kit])

  const sendCUSD = async () => {
    if (!address || !amount || !toAddress) return alert('Please fill in all fields.')

    try {
      const stableToken = await kit.contracts.getStableToken()
      const tx = await stableToken.transfer(
        toAddress,
        new BigNumber(kit.web3.utils.toWei(amount))
      ).send({ from: address })

      await tx.waitReceipt()
      alert(`✅ Successfully sent ${amount} cUSD to ${toAddress}`)
      setAmount('')
      setToAddress('')
    } catch (err: any) {
      console.error(err)
      alert('❌ Error while sending: ' + (err.message || err.toString()))
    }
  }

  if (!address) {
    return (
      <button
        className="bg-yellow-400 text-black px-4 py-2 rounded"
        onClick={connect}
      >
        Connect Wallet
      </button>
    )
  }

  return (
    <div className="p-4 border rounded mt-4 space-y-3">
      <p>📫 Connected Wallet: <code className="break-all">{address}</code></p>
      <p>💰 cUSD Balance: {balance}</p>

      <input
        className="border px-2 py-1 w-full"
        placeholder="Recipient address"
        value={toAddress}
        onChange={(e) => setToAddr1/1
Next.js 15.3.3Webpack
Runtime Error

TypeError: createContext only works in Client Components. Add the "use client" directive at the top of the file to use it. Read more: https://nextjs.org/docs/messages/context-in-server-component

Call Stack 43
Show 33 ignore-listed frame(s)
__webpack_require__
.next/server/webpack-runtime.js (33:43)
__webpack_require__
.next/server/webpack-runtime.js (33:43)
__webpack_require__
.next/server/webpack-runtime.js (33:43)
__webpack_require__
.next/server/webpack-runtime.js (33:43)
__webpack_require__
.next/server/webpack-runtime.js (33:43)
__webpack_require__
.next/server/webpack-runtime.js (33:43)
__webpack_require__
.next/server/webpack-runtime.js (33:43)
eval
./app/layout.tsx
<unknown>
rsc)/./app/layout.tsx (/home/jani/Documentos/playON_Celo/.next/server/app/page.js (33:1)
Function.__webpack_require__
.next/server/webpack-runtime.js (33:43)ess(e.target.value)}
      />
      <input
        className="border px-2 py-1 w-full"
        placeholder="Amount in cUSD"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button
        className="bg-green-500 text-white px-4 py-2 rounded"
        onClick={sendCUSD}
      >
        Send cUSD
      </button>
    </div>
  )
}
