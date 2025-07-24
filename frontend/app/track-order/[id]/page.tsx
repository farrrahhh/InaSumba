"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, Phone, Calendar, Clock } from "lucide-react"
import { api, type TransactionData } from "@/lib/api"

const trackingSteps = [
  {
    id: 1,
    title: "Order Confirmed",
    description: "Your order has been confirmed and is being prepared",
    icon: CheckCircle,
    completed: true,
    date: "2024-01-15 10:30",
  },
  {
    id: 2,
    title: "Processing",
    description: "Your order is being packed and prepared for shipment",
    icon: Package,
    completed: true,
    date: "2024-01-15 14:20",
  },
  {
    id: 3,
    title: "Shipped",
    description: "Your order has been shipped and is on the way",
    icon: Truck,
    completed: true,
    date: "2024-01-16 09:15",
  },
  {
    id: 4,
    title: "Delivered",
    description: "Your order has been delivered successfully",
    icon: CheckCircle,
    completed: false,
    date: "Estimated: 2024-01-18",
  },
]

export default function TrackOrderPage({ params }: { params: { id: string } }) {
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTransaction = async () => {
      try {
        const data = await api.trackOrder(params.id)
        setTransactionData(data)
      } catch (error) {
        console.error("Error loading transaction:", error)
      } finally {
        setLoading(false)
      }
    }
    loadTransaction()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!transactionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <Link href="/">
            <Button className="bg-orange-600 hover:bg-orange-700">Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-2xl font-bold text-orange-600">INASUMBA</span>
            </Link>
            <h1 className="text-lg font-semibold">Track Your Order</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Tracking */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order Status</CardTitle>
                  <Badge className="bg-green-100 text-green-800">
                    {transactionData.status === "paid" ? "In Transit" : transactionData.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {trackingSteps.map((step, index) => (
                    <div key={step.id} className="flex items-start space-x-4 relative">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          step.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <step.icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium ${step.completed ? "text-gray-900" : "text-gray-500"}`}>
                            {step.title}
                          </h3>
                          <span className="text-sm text-gray-500">{step.date}</span>
                        </div>
                        <p className={`text-sm ${step.completed ? "text-gray-600" : "text-gray-400"}`}>
                          {step.description}
                        </p>
                      </div>

                      {index < trackingSteps.length - 1 && (
                        <div
                          className={`absolute left-5 top-10 w-0.5 h-6 ${
                            step.completed ? "bg-green-200" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <span>Shipping Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Tracking Number</Label>
                    <p className="font-mono text-lg">{transactionData.resi || "Generating..."}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Courier</Label>
                    <p className="text-lg">JNE Express</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Estimated Delivery</Label>
                  <p className="text-lg">3-5 business days from order date</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Latest Update</h4>
                  <p className="text-blue-800 text-sm">
                    {transactionData.status === "paid"
                      ? "Your order has been confirmed and is being prepared for shipment."
                      : `Order status: ${transactionData.status}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Order ID</Label>
                  <p className="font-mono">{transactionData.transactionId}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Order Date</span>
                  </Label>
                  <p>
                    {new Date(transactionData.createdAt).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {transactionData.paidAt && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Payment Date</span>
                    </Label>
                    <p>
                      {new Date(transactionData.paidAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Image
                    src="/placeholder.svg?height=80&width=80&text=Product"
                    alt={transactionData.product.name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{transactionData.product.name}</h3>
                    <p className="text-sm text-gray-600">Qty: {transactionData.quantity}</p>
                    <p className="text-lg font-bold text-orange-600">
                      Rp {transactionData.product.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Shipping Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Delivery Address</Label>
                  <p className="text-gray-900">{transactionData.address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>Phone Number</span>
                  </Label>
                  <p className="text-gray-900">{transactionData.phoneNumber}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>Rp {transactionData.subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>Rp {transactionData.shipping.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total Paid:</span>
                  <span className="text-orange-600">Rp {transactionData.total.toLocaleString("id-ID")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full bg-transparent" variant="outline">
                Contact Seller
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                Download Invoice
              </Button>
              <Link href="/">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}
