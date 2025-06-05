"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useStore } from "@/lib/store"

export default function ArtistRegisterPage() {
  const router = useRouter()
  const addArtist = useStore((state) => state.addArtist)
  const setUserProfile = useStore((state) => state.setUserProfile)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    latitude: "",
    longitude: "",
    duration: "",
    streamingLink: "",
    walletAddress: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const artistId = addArtist({
        name: formData.name,
        location: formData.location,
        latitude: Number.parseFloat(formData.latitude),
        longitude: Number.parseFloat(formData.longitude),
        duration: Number.parseInt(formData.duration),
        streamingLink: formData.streamingLink,
        walletAddress: formData.walletAddress,
        isActive: true,
      })

      // Actualizar perfil de usuario con el ID del artista
      setUserProfile({
        type: "artist",
        artistId: artistId,
        walletAddress: formData.walletAddress,
      })

      setSuccess(true)
      setTimeout(() => {
        router.push("/artist/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Error registering artist:", error)
      // Add error state handling here if needed
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const goBack = () => {
    setUserProfile({ type: null })
    router.push("/")
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ¡Registro exitoso! Redirigiendo a tu dashboard...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button onClick={goBack} variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
        </div>

        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Registro de Artista</CardTitle>
            <CardDescription>Completa tus datos para empezar a transmitir y recibir donaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre artístico</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre artístico"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Textarea
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ej: Plaza San Martín, Buenos Aires"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitud</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="-34.6037"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitud</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="-58.3816"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duración (minutos)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="120"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="streamingLink">Link de streaming</Label>
                <Input
                  id="streamingLink"
                  name="streamingLink"
                  type="url"
                  value={formData.streamingLink}
                  onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="walletAddress">Dirección de wallet (ETH)</Label>
                <Input
                  id="walletAddress"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleChange}
                  placeholder="0x..."
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registrando..." : "Crear Perfil de Artista"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
