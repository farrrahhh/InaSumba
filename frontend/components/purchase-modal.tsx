"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone } from "lucide-react"
import { api } from "@/lib/api"

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    name: string
    price: number
  }
  quantity: number
}

export function PurchaseModal({ isOpen, onClose, product, quantity }: PurchaseModalProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    address: "",
    phoneNumber: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      router.push("/payment")
      onClose()
    } catch (error) {
      console.error("Error creating purchase:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-green-200">
        <DialogHeader className="border-b border-green-100 pb-4">
          <DialogTitle className="text-gray-800 text-lg font-semibold">Complete Your Purchase</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Product Summary */}
          <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Quantity: {quantity}</span>
              <span className="font-medium text-green-700">
                Rp {(product.price * quantity).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            <div>
              <Label htmlFor="address" className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <span>Shipping Address</span>
              </Label>
              <Textarea
                id="address"
                placeholder="Enter your complete shipping address..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                className="text-gray-700 placeholder:text-gray-400 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500 resize-none"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="phone" className="flex items-center space-x-2 text-gray-700 font-medium mb-2">
                <Phone className="h-4 w-4 text-green-600" />
                <span>Phone Number</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number..."
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
                className="text-gray-700 placeholder:text-gray-400 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6 border-t border-green-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 bg-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm transition-colors"
            >
              Continue to Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}