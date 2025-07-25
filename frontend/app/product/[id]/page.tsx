"use client"

import { useState, useEffect, use } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Heart, Share2, ArrowLeft, Plus, Minus, Play, ChevronLeft, ChevronRight } from "lucide-react"
import { PurchaseModal } from "@/components/purchase-modal"
import { api, Weaver, type Product as OriginalProduct } from "@/lib/api"

// Extend Product type to include optional weaver property
type Product = OriginalProduct & {
  weaver?: {
    name?: string
    bio?: string
    specialization?: string[]
  }
}

// Helper function to convert Google Drive share URL to direct view URL
const convertGoogleDriveUrl = (url: string) => {
  if (!url) return null
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (match) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`
  }
  return url
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const { id } = use(params)
  
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0)
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
          <p className="text-gray-600 mb-6">The product you re looking for doesn t exist.</p>
          <Link href="/products">
            <Button className="bg-green-600 hover:bg-green-700 text-white">Back to Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Create media array with photo and video (if available)
  type MediaItem = {
    type: 'image' | 'video',
    url: string | null,
    alt: string
  }
  const mediaItems: MediaItem[] = []
  
  if (product.photo_url) {
    mediaItems.push({
      type: 'image',
      url: convertGoogleDriveUrl(product.photo_url),
      alt: product.name
    })
  }
  
  if (product.video_url) {
    mediaItems.push({
      type: 'video',
      url: product.video_url,
      alt: `${product.name} - Weaving Process Video`
    })
  }

  // If no media available, use placeholder
  if (mediaItems.length === 0) {
    mediaItems.push({
      type: 'image',
      url: "/placeholder.svg?height=500&width=500&text=Product+Image",
      alt: product.name
    })
  }

  const nextMedia = () => {
    setSelectedMediaIndex((prev) => (prev + 1) % mediaItems.length)
  }

  const prevMedia = () => {
    setSelectedMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-2xl font-bold text-green-600">INASUMBA</span>
            </button>
            </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Media Slider */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-white rounded-lg overflow-hidden border border-green-100 shadow-sm">
              {mediaItems[selectedMediaIndex].type === 'image' ? (
                <Image
                  src={mediaItems[selectedMediaIndex].url || "/placeholder.svg"}
                  alt={mediaItems[selectedMediaIndex].alt}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <iframe
                    src={`https://drive.google.com/file/d/${product.video_url?.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1]}/preview`}
                    width="100%"
                    height="100%"
                    allow="autoplay"
                    className="border-none"
                  />
                </div>
              )}
              
              <Badge className={`absolute top-4 left-4 ${product.quantity > 0 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
              }`}>
                {product.quantity > 0 ? "In Stock" : "Out of Stock"}
              </Badge>

              {/* Navigation arrows */}
              {mediaItems.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={prevMedia}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={nextMedia}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Media type indicator */}
              <div className="absolute bottom-4 right-4">
                {mediaItems[selectedMediaIndex].type === 'video' && (
                  <Badge className="bg-red-600 text-white">
                    <Play className="h-3 w-3 mr-1" />
                    Video
                  </Badge>
                )}
              </div>
            </div>

            {/* Media thumbnails */}
            {mediaItems.length > 1 && (
              <div className="flex space-x-2">
                {mediaItems.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMediaIndex(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedMediaIndex === index
                        ? 'border-green-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {media.type === 'image' ? (
                      <Image
                        src={media.url || "/placeholder.svg"}
                        alt={media.alt}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-green-100 shadow-sm">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

              

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-green-700">Rp {product.price.toLocaleString("id-ID")}</span>
              </div>

              <div className="mb-6">
                <Badge variant="secondary" className="mr-2 bg-green-50 text-green-700 border-green-200">
                  Stock: {product.quantity}
                </Badge>
                <Badge variant="outline" className="text-gray-600 border-gray-300">{product.category}</Badge>
                <h4 className="font-semibold mb-2 text-amber-800">Description of Product</h4>
                <p className="text-sm text-gray-600 mt-2">{product.description}</p>
              </div>

              {/* Motif Meaning */}
              {product.meaning_motif && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold mb-2 text-amber-800">Cultural Meaning</h4>
                  <p className="text-sm text-amber-700">{product.meaning_motif }</p>
                </div>
              )}
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
            <TabsList className="grid w-full grid-cols-3 bg-green-50 border border-green-200">
              <TabsTrigger 
                value="description" 
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-700"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="cultural-meaning"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-700"
              >
                Cultural Meaning
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
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Description</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {product.long_description || "No description available for this product."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cultural-meaning" className="mt-6">
              <Card className="border-green-100">
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Cultural Significance</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {product.long_meaning_motif || "No cultural meaning information available for this product."}
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
                          <span className="text-green-600 font-bold text-2xl">
                            {product.weaver?.name
                              ? product.weaver.name.split(" ").map(n => n[0]).join("")
                              : "W"}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            {product.weaver?.name || "Weaver"}
                          </h3>
                          <p className="text-green-600 font-medium">
                            {"Weaver"}
                          </p>
                          <p className="text-sm text-gray-600">
                            { "Sumba, Indonesia"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2 text-gray-800">About the Artisan</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {product.weaver?.bio 
                            }
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2 text-gray-800">Specialization</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            {Array.isArray(product.weaver?.specialization) && product.weaver.specialization.length > 0
                              ? product.weaver.specialization.map((spec: string, idx: number) => (
                                  <li key={idx}>• {spec}</li>
                                ))
                              : (
                                <>
                                  <li>• Traditional Sumba Woven Textiles</li>
                                  <li>• Natural Dye Techniques</li>
                                  <li>• Cultural Pattern Preservation</li>
                                  <li>• Community Workshop Leadership</li>
                                </>
                              )
                            }
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