"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"


export default function PaymentPage() {
  const router = useRouter()

const handleBack = () => {
    router.back()
}

  const handleConfirmPayment = () => {
    router.push("/shop")
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/background2.jpg" alt="Nature Background" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-green-100/20" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen pb-24">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button onClick={handleBack} variant="ghost" className="mb-4 text-white hover:bg-amber-100 font-bold">
                <ArrowLeft className="h-8 w-8 mr-2" />
                <span className="font-bold">Back to Home</span>
            </Button>
          </div>

          {/* Payment Content */}
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-amber-100/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-200 max-w-md w-full">
              {/* QR Code */}
              <div className="flex justify-center mb-8">
                <div className="bg-white p-4 rounded-2xl shadow-lg">
                  <Image
                    src="/images/qr-code.png"
                    alt="Payment QR Code"
                    width={250}
                    height={250}
                    className="w-64 h-64"
                  />
                </div>
              </div>

              {/* Confirmation Button */}
              <Button
                onClick={handleConfirmPayment}
                className="w-full bg-amber-800 hover:bg-amber-900 text-white py-4 text-lg font-semibold rounded-2xl"
                size="lg"
              >
                Confirmation Payment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      
    </div>
  )
}
