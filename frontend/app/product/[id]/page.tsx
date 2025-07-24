"use client"

import { useState, useEffect, use } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Heart, Share2, ArrowLeft, Plus, Minus, Play } from "lucide-react"
import { PurchaseModal } from "@/components/purchase-modal"
import { api, type Product } from "@/lib/api"

const relatedProducts = [
  {
    id: "2",
    name: "Tas Tenun Tradisional",
    price: 150000,
    image: "/placeholder.svg?height=200&width=200&text=Tas+Tenun",
    rating: 4.6,
  },
  {
    id: "3",
    name: "Kerajinan Kayu Sumba",
    price: 180000,
    image: "/placeholder.svg?height=200&width=200&text=Kerajinan+Kayu",
    rating: 4.9,
  },
  {
    id: "4",
    name: "Perhiasan Perak",
    price: 320000,
    image: "/placeholder.svg?height=200&width=200&text=Perhiasan+Perak",
    rating: 4.7,
  },
]

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const { id } = use(params)
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await api.getProduct(id)
        setProduct(data)
      } catch (error) {
        console.error("Error loading product:", error)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/products">
            <Button className="bg-green-600 hover:bg-green-700 text-white">Back to Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  const productImages = [
    product.photo_url || "/placeholder.svg?height=500&width=500&text=Product+Main",
    "/placeholder.svg?height=500&width=500&text=Product+Detail+1",
    "/placeholder.svg?height=500&width=500&text=Product+Detail+2",
    "/placeholder.svg?height=500&width=500&text=Product+Detail+3",
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-2xl font-bold text-green-600">INASUMBA</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-white rounded-lg overflow-hidden border border-green-100 shadow-sm">
              <Image
                src={productImages[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
              <Badge className={`absolute top-4 left-4 ${product.quantity > 0 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
              }`}>
                {product.quantity > 0 ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-green-100 shadow-sm">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">4.0 (124 reviews)</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-green-700">Rp {product.price.toLocaleString("id-ID")}</span>
              </div>

              <div className="mb-6">
                <Badge variant="secondary" className="mr-2 bg-green-50 text-green-700 border-green-200">
                  Stock: {product.quantity}
                </Badge>
                <Badge variant="outline" className="text-gray-600 border-gray-300">Traditional Craft</Badge>
                <p className="text-sm text-gray-600 mt-2">Handcrafted by skilled artisans from Sumba, preserving centuries-old weaving traditions passed down through generations.</p>
              </div>
            </div>

            {/* Weaver Profile */}
            <div className="bg-white p-6 rounded-lg border border-green-100 shadow-sm">
              <h3 className="font-semibold mb-4 text-gray-800 flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                Weaver Profile
              </h3>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-lg">MW</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 mb-1">Maria Wangge</h4>
                  <p className="text-sm text-gray-600 mb-2">Master Weaver from East Sumba</p>
                  <p className="text-xs text-gray-500">35+ years of experience in traditional Sumba weaving techniques</p>
                  {product.video_url && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => window.open(product.video_url, '_blank')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Watch Weaving Process
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="bg-white p-6 rounded-lg border border-green-100 shadow-sm space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-gray-600 hover:text-green-600 hover:bg-green-50"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium text-gray-700 min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    className="text-gray-600 hover:text-green-600 hover:bg-green-50"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  size="lg"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm transition-colors"
                  onClick={() => setShowPurchaseModal(true)}
                  disabled={product.quantity === 0}
                >
                  {product.quantity === 0 ? "Out of Stock" : "Buy Now"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-green-50 border border-green-200">
              <TabsTrigger 
                value="description" 
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-700"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="weaver-profile"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-700"
              >
                Weaver Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card className="border-green-100">
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {product.description || "No description available for this product."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weaver-profile" className="mt-6">
              <Card className="border-green-100">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold text-2xl">MW</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">Maria Wangge</h3>
                          <p className="text-green-600 font-medium">Master Weaver</p>
                          <p className="text-sm text-gray-600">East Sumba, Indonesia</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2 text-gray-800">About the Artisan</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            Maria Wangge is a renowned master weaver from East Sumba with over 35 years of experience 
                            in traditional textile creation. She learned the ancient art of ikat weaving from her 
                            grandmother and has dedicated her life to preserving this cultural heritage.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2 text-gray-800">Specialization</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Traditional Sumba Ikat Textiles</li>
                            <li>• Natural Dye Techniques</li>
                            <li>• Cultural Pattern Preservation</li>
                            <li>• Community Workshop Leadership</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-4 text-gray-800">Crafting Process</h4>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">1</div>
                          <div>
                            <p className="font-medium text-gray-800">Thread Preparation</p>
                            <p className="text-sm text-gray-600">Hand-spun cotton threads are carefully prepared</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">2</div>
                          <div>
                            <p className="font-medium text-gray-800">Natural Dyeing</p>
                            <p className="text-sm text-gray-600">Traditional plant-based dyes create vibrant colors</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">3</div>
                          <div>
                            <p className="font-medium text-gray-800">Pattern Binding</p>
                            <p className="text-sm text-gray-600">Intricate patterns are bound before dyeing</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">4</div>
                          <div>
                            <p className="font-medium text-gray-800">Hand Weaving</p>
                            <p className="text-sm text-gray-600">Final weaving process takes weeks to complete</p>
                          </div>
                        </div>
                      </div>
                      
                      {product.video_url && (
                        <div className="mt-6 p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-700 mb-3">Watch Maria demonstrate her weaving techniques:</p>
                          <Button 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => window.open(product.video_url, '_blank')}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Watch Weaving Video
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        product={{
          id: product.product_id,
          name: product.name,
          price: product.price,
        }}
        quantity={quantity}
      />
    </div>
  )
}