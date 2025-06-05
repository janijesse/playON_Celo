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
       
      </CardContent>
    </Card>
  )
}
