// Create a reusable MetaMask guide component
import { ExternalLink, Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MetaMaskGuide() {
  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Wallet className="h-5 w-5" />
          <span>How to Install MetaMask</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-300">
          MetaMask is a digital wallet that allows you to interact with the Ethereum blockchain. Follow these steps to
          install it:
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
  )
}
