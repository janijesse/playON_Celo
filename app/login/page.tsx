"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Wallet, Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/lib/store"
import { connectWallet } from "@/lib/web3"

export default function LoginPage() {
  const router = useRouter()
  const loginWithEmail = useStore((state) => state.loginWithEmail)
  const loginWithWallet = useStore((state) => state.loginWithWallet)
  const auth = useStore((state) => state.auth)

  const [emailForm, setEmailForm] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const user = await loginWithEmail(emailForm.email, emailForm.password)
      if (user) {
        // Redirigir según el tipo de usuario
        if (user.type === "artist") {
          router.push("/artist/dashboard")
        } else {
          router.push("/user")
        }
      } else {
        setError("Credenciales incorrectas")
      }
    } catch (err) {
      setError("Error al iniciar sesión")
    }
  }

  const handleWalletLogin = async () => {
    setIsConnectingWallet(true)
    setError("")

    try {
      const walletAddress = await connectWallet()
      const user = await loginWithWallet(walletAddress)

      if (user) {
        // Redirigir según el tipo de usuario
        if (user.type === "artist") {
          router.push("/artist/dashboard")
        } else {
          router.push("/user")
        }
      } else {
        setError("Wallet no registrada. Por favor regístrate primero.")
      }
    } catch (err: any) {
      setError(err.message || "Error al conectar wallet")
    } finally {
      setIsConnectingWallet(false)
    }
  }

  const goBack = () => {
    router.push("/")
  }

  const goToRegister = () => {
    router.push("/register")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            onClick={goBack}
            variant="outline"
            className="border-white/30 bg-white/10 hover:bg-white/20 text-white hover:text-white backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Iniciar Sesión</CardTitle>
              <CardDescription className="text-purple-200">Accede a tu cuenta para continuar</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="email" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-white/10">
                  <TabsTrigger value="email" className="data-[state=active]:bg-white/20 text-white">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="wallet" className="data-[state=active]:bg-white/20 text-white">
                    <Wallet className="h-4 w-4 mr-2" />
                    Wallet
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-4">
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={emailForm.email}
                        onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white">
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={emailForm.password}
                          onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                          className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={auth.isLoading}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 text-white font-semibold py-3 rounded-xl"
                    >
                      {auth.isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4 mr-2" />
                      )}
                      Iniciar Sesión
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="wallet" className="space-y-4">
                  <div className="text-center py-6">
                    <Wallet className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                    <p className="text-purple-200 mb-6">Conecta tu wallet MetaMask para acceder a tu cuenta</p>
                    <Button
                      onClick={handleWalletLogin}
                      disabled={isConnectingWallet}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-0 text-white font-semibold py-3 rounded-xl"
                    >
                      {isConnectingWallet ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Wallet className="h-4 w-4 mr-2" />
                      )}
                      Conectar MetaMask
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="mt-6 text-center">
                <p className="text-purple-200 text-sm">
                  ¿No tienes cuenta?{" "}
                  <button onClick={goToRegister} className="text-yellow-400 hover:text-yellow-300 font-medium">
                    Regístrate aquí
                  </button>
                </p>
              </div>

              {/* Demo credentials */}
              <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white font-medium mb-2">🎭 Cuentas de prueba:</h4>
                <div className="space-y-2 text-sm">
                  <div className="text-purple-200">
                    <strong>Artista:</strong> carlos@example.com
                  </div>
                  <div className="text-purple-200">
                    <strong>Espectador:</strong> juan@example.com
                  </div>
                  <div className="text-purple-300 text-xs mt-2">Contraseña: cualquier cosa (es demo)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
