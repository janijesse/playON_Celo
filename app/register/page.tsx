"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Wallet, Loader2, Eye, EyeOff, User, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"
import { connectWallet } from "@/lib/web3"
import type { UserType } from "@/lib/types"

export default function RegisterPage() {
  const router = useRouter()
  const registerUser = useStore((state) => state.registerUser)

  const [userType, setUserType] = useState<UserType>("user")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    walletAddress: "",
    artisticName: "",
    bio: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isConnectingWallet, setIsConnectingWallet] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        walletAddress: formData.walletAddress,
        type: userType,
        ...(userType === "artist" && {
          artistProfile: {
            artisticName: formData.artisticName || formData.name,
            bio: formData.bio,
            genres: [],
          },
        }),
      }

      const user = await registerUser(userData)

      // Redirigir según el tipo de usuario
      if (user.type === "artist") {
        router.push("/artist/dashboard")
      } else {
        router.push("/user")
      }
    } catch (err) {
      setError("Error al registrar usuario")
    } finally {
      setIsLoading(false)
    }
  }

  const connectWalletAddress = async () => {
    setIsConnectingWallet(true)
    setError("")

    try {
      const walletAddress = await connectWallet()
      setFormData({ ...formData, walletAddress })
    } catch (err: any) {
      setError(err.message || "Error al conectar wallet")
    } finally {
      setIsConnectingWallet(false)
    }
  }

  const goBack = () => {
    router.push("/")
  }

  const goToLogin = () => {
    router.push("/login")
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
              <CardTitle className="text-2xl text-white">Crear Cuenta</CardTitle>
              <CardDescription className="text-purple-200">Únete a la comunidad de Street Artists</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipo de usuario */}
                <div className="space-y-3">
                  <Label className="text-white">¿Qué tipo de cuenta quieres crear?</Label>
                  <RadioGroup
                    value={userType}
                    onValueChange={(value) => setUserType(value as UserType)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-3 border border-white/20">
                      <RadioGroupItem value="user" id="user" className="text-white" />
                      <Label htmlFor="user" className="text-white cursor-pointer flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Espectador
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-3 border border-white/20">
                      <RadioGroupItem value="artist" id="artist" className="text-white" />
                      <Label htmlFor="artist" className="text-white cursor-pointer flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Artista
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Información básica */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">
                      Nombre completo
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tu nombre completo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                  <div className="space-y-2">
                    <Label htmlFor="wallet" className="text-white">
                      Wallet Address (opcional)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="wallet"
                        type="text"
                        placeholder="0x..."
                        value={formData.walletAddress}
                        onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400"
                      />
                      <Button
                        type="button"
                        onClick={connectWalletAddress}
                        disabled={isConnectingWallet}
                        variant="outline"
                        className="border-white/30 bg-white/10 hover:bg-white/20 text-white hover:text-white"
                      >
                        {isConnectingWallet ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Wallet className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Información adicional para artistas */}
                {userType === "artist" && (
                  <div className="space-y-4 border-t border-white/20 pt-4">
                    <h3 className="text-white font-medium">Información de artista</h3>

                    <div className="space-y-2">
                      <Label htmlFor="artisticName" className="text-white">
                        Nombre artístico (opcional)
                      </Label>
                      <Input
                        id="artisticName"
                        type="text"
                        placeholder="Tu nombre artístico"
                        value={formData.artisticName}
                        onChange={(e) => setFormData({ ...formData, artisticName: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-white">
                        Biografía (opcional)
                      </Label>
                      <Textarea
                        id="bio"
                        placeholder="Cuéntanos sobre tu arte..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-400"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-0 text-white font-semibold py-3 rounded-xl"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : userType === "artist" ? (
                    <Palette className="h-4 w-4 mr-2" />
                  ) : (
                    <User className="h-4 w-4 mr-2" />
                  )}
                  Crear Cuenta
                </Button>
              </form>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="mt-6 text-center">
                <p className="text-purple-200 text-sm">
                  ¿Ya tienes cuenta?{" "}
                  <button onClick={goToLogin} className="text-yellow-400 hover:text-yellow-300 font-medium">
                    Inicia sesión aquí
                  </button>
                </p>
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
