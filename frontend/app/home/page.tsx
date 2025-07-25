"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import BottomNavbar from "@/components/navbar-home"

export default function ChatbotLanding() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")

    if (isLoggedIn !== "true") {
      window.location.href = "/login"
      return
    }

    setIsLoaded(true)

    
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration)
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError)
        })
    }
  }, [])



  const handleStartConversation = () => {
    window.location.href = "/chatbot"
  }

  return (
    <div className="min-h-screen max-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {/* Mobile Background */}
        <Image
          src="/images/mobile.png"
          alt="Mobile Background"
          fill
          className="object-cover md:hidden"
          priority
        />
        {/* Desktop Background */}
        <div className="hidden md:block absolute inset-0">
          <Image
            src="/images/background.jpg"
            alt="Desktop Background"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 z-0" />

      {/* Title for Desktop */}
      <div
        className={`absolute top-4 md:top-8 left-0 right-0 text-center z-20 transition-all duration-1000 hidden md:block ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <Image
          src="/images/name.png"
          alt="Ina Na"
          width={450}
          height={80}
          className="mx-auto mb-2 md:mb-4 drop-shadow-2xl"
        />
      </div>

      {/* Logo for Mobile */}
      <div
        className={`absolute top-4 left-0 right-0 text-center z-20 transition-all duration-1000 md:hidden ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <Image
          src="/images/logo.png"
          alt="Ina Na Logo"
          width={80}
          height={80}
          className="logo-mobile-bigger mx-auto mb-2 drop-shadow-2xl"
          priority
        />
      </div>

      <div
        className={`absolute top-4 md:top-8 left-0 right-0 text-center z-20 transition-all duration-1000 hidden md:block ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <Image
          src="/images/name.png"
          alt="Ina Na"
          width={450}
          height={80}
          className="mx-auto mb-2 md:mb-4 drop-shadow-2xl"
        />
      </div>


      {/* Main */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Main Content */}
        <main className="flex-1 relative z-10">
          {/* Ina Na Floating from Bottom */}
          <div
            className={`absolute left-1/2 bottom-[-120px] transform -translate-x-1/2 transition-all duration-1000 delay-300 ${
              isLoaded ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"
            }`}
          >
            {/* Show title below INA-NA.gif on small screens only */}
            <div
              className={`absolute left-1/2 top-[-70px] transform -translate-x-1/2 z-20 transition-all duration-1000 md:hidden ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
            <Image
              src="/images/name.png"
              alt="Ina Na"
              width={320}
              height={60}
              className="name-mobile-bigger mx-auto mb-2 drop-shadow-2xl w-[260px] h-auto"
              priority
            />
            </div>
            <div className="relative">
             <Image
              src="/images/INA-NA.gif"
              alt="Ina Na Character"
              width={480}
              height={600}
              className="ina-na-mobile-bigger md:w-[360px] lg:w-[440px] h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-300"
              priority
            />


              {/* Glow effect */}
              <div className="absolute inset-0 bg-yellow-200/20 rounded-full blur-2xl -z-10 scale-125" />
            </div>
            </div>
            
        </main>


        {/* CTA Button */}
        <footer className="p-6 md:p-8 pb-8 md:pb-12">
          <div
            className={`text-center transition-all duration-1000 delay-700 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <Button
              onClick={handleStartConversation}
              size="lg"
              className="bg-[#92846A] hover:bg-[#7e735e] text-white font-semibold px-8 py-4 text-lg md:text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 min-w-[200px] md:min-w-[280px]"
              style={{ borderRadius: "40px" }}
            >
              Start Conversation!
            </Button>
          </div>
        </footer>

        <BottomNavbar />
      </div>

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center z-20">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-6" />
            <p className="text-xl font-semibold">Loading...</p>
            <p className="text-sm opacity-80 mt-2">Preparing your conversation with Ina Na</p>
          </div>
        </div>
      )}
    </div>
  )
}
