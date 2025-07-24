"use client"

import { useState, useEffect, use } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Heart, Share2, ArrowLeft, Plus, Minus } from "lucide-react"
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

            <div className="grid grid-cols-4 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square relative bg-white rounded-lg overflow-hidden border-2 hover:border-green-400 transition-colors ${
                    selectedImage === index ? "border-green-600" : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
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
            <TabsList className="grid w-full grid-cols-3 bg-green-50 border border-green-200">
              <TabsTrigger 
                value="description" 
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-700"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="additional"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-700"
              >
                Additional Info
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-700"
              >
                Customer Reviews
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

            <TabsContent value="additional" className="mt-6">
              <Card className="border-green-100">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-4 text-gray-800">Product Features</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center text-gray-700">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                          100% Handmade
                        </li>
                        <li className="flex items-center text-gray-700">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                          Traditional Sumba Design
                        </li>
                        <li className="flex items-center text-gray-700">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                          Premium Quality
                        </li>
                        <li className="flex items-center text-gray-700">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                          Cultural Heritage
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-4 text-gray-800">Care Instructions</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Handle with care</li>
                        <li>• Keep in dry place</li>
                        <li>• Avoid direct sunlight</li>
                        <li>• Clean gently when needed</li>
                        <li>• Store properly</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card className="border-green-100">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {[
                      {
                        name: "Sari Dewi",
                        rating: 5,
                        date: "2 weeks ago",
                        review: "Produk yang sangat berkualitas! Sesuai dengan deskripsi dan pengiriman cepat.",
                      },
                      {
                        name: "Budi Santoso",
                        rating: 5,
                        date: "1 month ago",
                        review: "Sangat puas dengan pembelian ini. Kualitas bagus dan pelayanan memuaskan!",
                      },
                      {
                        name: "Maya Sari",
                        rating: 4,
                        date: "2 months ago",
                        review: "Bagus, sesuai dengan ekspektasi. Packaging rapi dan aman.",
                      },
                    ].map((review, index) => (
                      <div key={index} className="border-b border-green-100 pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-800">{review.name}</span>
                            <div className="flex">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-gray-700">{review.review}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">Related Products</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card key={relatedProduct.id} className="group hover:shadow-lg transition-shadow border-green-100">
                <CardContent className="p-0">
                  <div className="relative">
                    <Image
                      src={relatedProduct.image || "/placeholder.svg"}
                      alt={relatedProduct.name}
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  </div>
                  <div className="p-4">
                    <Link href={`/product/${relatedProduct.id}`}>
                      <h3 className="font-semibold text-gray-800 mb-2 hover:text-green-600 transition-colors">
                        {relatedProduct.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-700">
                        Rp {relatedProduct.price.toLocaleString("id-ID")}
                      </span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{relatedProduct.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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