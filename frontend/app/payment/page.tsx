"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, CheckCircle, Copy } from "lucide-react"
import { api } from "@/lib/api"

interface TransactionData {
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
  transactionId: string
  status: string
  createdAt: string
}

export default function PaymentPage() {
  const router = useRouter()
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null)
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes in seconds
  const [paymentCompleted, setPaymentCompleted] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem("transactionData")
    if (data) {
      setTransactionData(JSON.parse(data))
    } else {
      router.push("/")
    }
  }, [router])

  useEffect(() => {
    if (timeLeft > 0 && !paymentCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, paymentCompleted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handlePaymentComplete = async () => {
    if (transactionData) {
      try {
        // Confirm payment via API
        const result = await api.confirmPayment(transactionData.transactionId)

        // Update transaction status
        const updatedTransaction = {
          ...transactionData,
          status: result.status,
          resi: result.resi,
          paidAt: new Date().toISOString(),
        }

        localStorage.setItem("transactionData", JSON.stringify(updatedTransaction))
        setPaymentCompleted(true)

        // Redirect to tracking page
        setTimeout(() => {
          router.push(`/track-order/${updatedTransaction.transactionId}`)
        }, 2000)
      } catch (error) {
        console.error("Error confirming payment:", error)
        // Handle error
      }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  useEffect(() => {
    const generateQRIS = async () => {
      if (transactionData) {
        try {
          const qrisData = await api.generateQRIS(transactionData.transactionId)
          // You can store the QRIS code if needed
          console.log("QRIS generated:", qrisData.qris_code)
        } catch (error) {
          console.error("Error generating QRIS:", error)
        }
      }
    }
    generateQRIS()
  }, [transactionData])

  if (!transactionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (paymentCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your payment has been processed successfully. Redirecting to order tracking...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/payment-summary" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-2xl font-bold text-orange-600">INASUMBA</span>
            </Link>
            <h1 className="text-lg font-semibold">Payment</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Instructions */}
          <div className="space-y-6">
            {/* Timer */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Complete payment within:</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{formatTime(timeLeft)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">How to Pay with QRIS:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                    <li>Open your mobile banking or e-wallet app</li>
                    <li>Select &quot;Scan QR&quot; or &quot;QRIS&quot; feature</li>
                    <li>Scan the QR code on the right</li>
                    <li>Verify the payment amount</li>
                    <li>Complete the payment</li>
                    <li>Click &quot;I have paid&quot; button below</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">{transactionData.transactionId}</span>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(transactionData.transactionId)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-bold">Rp {transactionData.total.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Image
                    src="/placeholder.svg?height=60&width=60&text=Product"
                    alt={transactionData.product.name}
                    width={60}
                    height={60}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{transactionData.product.name}</h3>
                    <p className="text-sm text-gray-600">Qty: {transactionData.quantity}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rp {transactionData.subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>Rp {transactionData.shipping.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>Rp {transactionData.total.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Code */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Scan QR Code to Pay</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 mb-6">
                  <Image
                    src="/placeholder.svg?height=250&width=250&text=QRIS+QR+Code"
                    alt="QRIS QR Code"
                    width={250}
                    height={250}
                    className="mx-auto"
                  />
                </div>

                <div className="space-y-4">
                  <Badge variant="secondary" className="text-sm">
                    Supported by all major e-wallets and banks
                  </Badge>

                  <div className="flex justify-center space-x-4 text-xs text-gray-600">
                    <span>GoPay</span>
                    <span>•</span>
                    <span>OVO</span>
                    <span>•</span>
                    <span>DANA</span>
                    <span>•</span>
                    <span>ShopeePay</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handlePaymentComplete} className="w-full bg-green-600 hover:bg-green-700" size="lg">
              I Have Paid
            </Button>

            <div className="text-center text-sm text-gray-500">
              <p>Having trouble? Contact our support team</p>
              <p className="font-medium">WhatsApp: +62 812-3456-7890</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
