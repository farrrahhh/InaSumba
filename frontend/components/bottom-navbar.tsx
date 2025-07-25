"use client"

import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import clsx from "clsx"

export default function BottomNavbar() {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    {
      label: "Ina Talk",
      icon: "/images/camera-icon.png",
      path: "/translation",
    },
    {
      label: "Ina Tenun",
      icon: "/images/detect-icon.png",
      path: "/classification",
    },
    {
      label: "Ina Shop",
      icon: "/images/shop-icon.png",
      path: "/shop",
    },
    {
      label: "Ina Profile",
      icon: "/images/user-icon.png",
      path: "/profile",
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="relative bg-white px-6 py-4 rounded-t-xl shadow-md border-t border-gray-200">
        {/* Avatar Tengah */}
        <div className="absolute inset-x-0 -top-8 flex justify-center">
          <div
            className="w-20 h-20 rounded-full bg-white shadow-lg border-4 border-white overflow-hidden cursor-pointer"
            onClick={() => router.push("/home")}
          >
            <Image
              src="/images/avatar.png"
              alt="Ina Avatar"
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Navigasi */}
        <div className="flex justify-between items-center max-w-3xl mx-auto px-4">
          {navItems.slice(0, 2).map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center space-y-1 px-2"
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={28}
                height={28}
                className={clsx("transition-all", {
                  "brightness-100": pathname === item.path,
                  "brightness-50": pathname !== item.path,
                })}
              />
              <span
                className={clsx("text-xs font-medium", {
                  "text-amber-600": pathname === item.path,
                  "text-gray-500": pathname !== item.path,
                })}
              >
                {item.label}
              </span>
            </button>
          ))}

          <div className="w-20" /> {/* Spacer */}

          {navItems.slice(2).map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center space-y-1 px-2"
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={28}
                height={28}
                className={clsx("transition-all", {
                  "brightness-100": pathname === item.path,
                  "brightness-50": pathname !== item.path,
                })}
              />
              <span
                className={clsx("text-xs font-medium", {
                  "text-amber-600": pathname === item.path,
                  "text-gray-500": pathname !== item.path,
                })}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
