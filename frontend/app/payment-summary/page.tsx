"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MapPin, Phone, Package } from "lucide-react"

interface PurchaseData {
  product: {
    id: string
    name: string
    price: number
  }
  quantity: number
  address: string
  phoneNumber: string
  subtotal: number
  shipping: number
  total: number
}

export function PaymentSummaryPage() {
  const router = useRouter()
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null)

  useEffect(() => {
    const data = localStorage.getItem("purchaseData")
    if (data) {
      setPurchaseData(JSON.parse(data))
    } else {
      router.push("/")
    }
  }, [router])

  const handleProceedToPayment = () => {
    if (purchaseData) {
      // Generate transaction ID
      const transactionId = "TXN" + Date.now().toString().slice(-8)

      // Store transaction data
      const transactionData = {
        ...purchaseData,
        transactionId,
        status: "pending",
        createdAt: new Date().toISOString(),
      }

      localStorage.setItem("transactionData", JSON.stringify(transactionData))
      router.push("/payment")
    }
  }

  if (!purchaseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-2xl font-bold text-orange-600">INASUMBA</span>
            </Link>
            <h1 className="text-lg font-semibold">Payment Summary</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Order Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Image
                    src="/placeholder.svg?height=80&width=80&text=Product"
                    alt={purchaseData.product.name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{purchaseData.product.name}</h3>
                    <p className="text-gray-600">Quantity: {purchaseData.quantity}</p>
                    <p className="text-lg font-bold text-orange-600">
                      Rp {purchaseData.product.price.toLocaleString("id-ID")} each
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Shipping Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Shipping Address</Label>
                  <p className="mt-1 text-gray-900">{purchaseData.address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>Phone Number</span>
                  </Label>
                  <p className="mt-1 text-gray-900">{purchaseData.phoneNumber}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>
                    Subtotal ({purchaseData.quantity} item{purchaseData.quantity > 1 ? "s" : ""})
                  </span>
                  <span>Rp {purchaseData.subtotal.toLocaleString("id-ID")}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>Rp {purchaseData.shipping.toLocaleString("id-ID")}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">Rp {purchaseData.total.toLocaleString("id-ID")}</span>
                </div>

                <div className="pt-4 space-y-3">
                  <Button
                    onClick={handleProceedToPayment}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    size="lg"
                  >
                    Proceed to Payment
                  </Button>

                  <Button variant="outline" className="w-full bg-transparent" onClick={() => router.back()}>
                    Back to Product
                  </Button>
                </div>

                <div className="text-xs text-gray-500 pt-4">
                  <p>• Free returns within 7 days</p>
                  <p>• Secure payment processing</p>
                  <p>• Estimated delivery: 3-5 business days</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}
