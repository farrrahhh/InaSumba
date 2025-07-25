"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { User, Loader2 } from "lucide-react"
import ProfileForm from "../../components/profile-form"
import BottomNavbar from "@/components/bottom-navbar"
import { getProfile } from "@/lib/profile-api"
import { useToast } from "@/hooks/use-toast"
import type { ProfileResponse } from "@/lib/profile-api"
import Link from "next/link"

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setIsLoading(false)
        toast({
          title: "User Not Found",
          description: "No user ID found. Please sign in again.",
          variant: "destructive",
        })
        return
      }
      try {
        const profileData = await getProfile(userId)
        setProfile(profileData)
      } catch (error) {
        console.error("Failed to load profile:", error)
        toast({
          title: "Loading Failed",
          description: "Unable to load profile information",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [toast, userId])

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    const storedUserId = localStorage.getItem("user_id")

    if (isLoggedIn !== "true" || !storedUserId) {
      toast({
        title: "Unauthorized",
        description: "Please log in first.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setUserId(storedUserId)
  }, [router, toast])


  const handleProfileUpdate = (updatedProfile: ProfileResponse) => {
    setProfile(updatedProfile)
  }

  const handleLogout = () => {
    // Clear any stored authentication data
    // In a real app, you would clear tokens, cookies, etc.
    localStorage.removeItem("user_token")
    sessionStorage.clear()

    toast({
      title: "Signed Out",
      description: "You have been successfully signed out",
    })

    // Redirect to home page or login page
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/images/background.jpg" alt="Nature Background" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-green-100/20" />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-amber-600" />
            <p className="text-amber-800">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/images/background.jpg" alt="Nature Background" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-green-100/20" />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-amber-600" />
            <p className="text-amber-800">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/background.jpg" alt="Nature Background" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-green-100/20" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen pb-24">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            
            <div className="max-w-2xl mx-auto rounded-2xl p-6 shadow-lg border border-green-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-amber-600" />
                </div>
                <div className="w-full">
                  <h1 className="text-2xl font-bold text-amber-800 text-center">My Profile</h1>
                  <p className="text-gray-600 text-center">Manage your account settings and preferences</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="max-w-2xl mx-auto">
            <ProfileForm profile={profile} onProfileUpdate={handleProfileUpdate} onLogout={handleLogout} />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  )
}
