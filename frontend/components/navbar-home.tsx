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
      <div className="relative bg-white px-4 py-3 rounded-t-xl shadow-md border-t border-gray-200">
        {/* Tombol Start Conversation di Atas Navbar */}
        <div className="absolute inset-x-0 -top-8 md:-top-6 flex justify-center">
          <button
            onClick={() => router.push("/chatbot")}
            className="px-4 py-2 md:px-6 md:py-3 bg-white border border-gray-300 shadow-md rounded-full flex items-center active:scale-95 transition-transform duration-150"
          >
            <span className="text-sm md:text-[15px] text-brown-700 font-semibold whitespace-nowrap">
              Start Conversation
            </span>
          </button>
        </div>

        
        <div className="flex justify-center items-center">
          
          <div className="flex justify-between items-center w-full max-w-sm md:hidden">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center space-y-1 flex-1"
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                  className={clsx("transition-all", {
                    "brightness-100": pathname === item.path,
                    "brightness-50": pathname !== item.path,
                  })}
                />
                <span
                  className={clsx("text-xs font-medium text-center leading-tight", {
                    "text-amber-600": pathname === item.path,
                    "text-gray-500": pathname !== item.path,
                  })}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          
          <div className="hidden md:flex justify-center items-center">
            <div className="flex items-center space-x-24">
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
              <div className="w-16" />
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
      </div>
    </div>
  )
}