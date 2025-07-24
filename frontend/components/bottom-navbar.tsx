"use client"

import Image from "next/image"

export default function BottomNavbar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-md border-t border-green-200 px-6 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Camera Icon */}
          <button className="p-3 rounded-full hover:bg-green-100 transition-colors">
            <Image src="/images/camera-icon.png" alt="Camera" width={24} height={24} className="w-6 h-6" />
          </button>

          {/* Detect Icon */}
          <button className="p-3 rounded-full hover:bg-green-100 transition-colors">
            <Image src="/images/detect-icon.png" alt="Detect" width={24} height={24} className="w-6 h-6" />
          </button>

          {/* Center Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-white shadow-lg border-4 border-white overflow-hidden">
              <Image
                src="/images/avatar.png"
                alt="Ina Avatar"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Shop Icon */}
          <button className="p-3 rounded-full hover:bg-green-100 transition-colors">
            <Image src="/images/shop-icon.png" alt="Shop" width={24} height={24} className="w-6 h-6" />
          </button>

          {/* User Icon */}
          <button className="p-3 rounded-full hover:bg-green-100 transition-colors">
            <Image src="/images/user-icon.png" alt="Profile" width={24} height={24} className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
