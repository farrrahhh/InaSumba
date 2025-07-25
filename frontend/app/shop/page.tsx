"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ShoppingCart, Heart } from "lucide-react"
import { api, type Product } from "@/lib/api"
import BottomNavbar from "@/components/bottom-navbar"

// Helper function to convert Google Drive URLs to direct image URLs
const convertGoogleDriveUrl = (url: string | null): string => {
  if (!url) return "/placeholder.svg"
  
  // Check if it's a Google Drive URL
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (match) {
    const fileId = match[1]
    return `https://drive.google.com/uc?export=view&id=${fileId}`
  }
  
  return url
}

export default function ShopMain() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await api.getProducts()
        console.log("Fetched products:", data) // Debug log
        setProducts(data.slice(0, 6))
      } catch (error) {
        console.error("Error loading products:", error)
        setError("Failed to load products. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")

    if (isLoggedIn !== "true") {
      window.location.href = "/login"
      return
    }
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Products</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
    <section className="relative w-full h-40 sm:h-100 md:h-80 lg:h-[480px] overflow-hidden">
      <Image
        src="/images/banner.png"
        alt="Banner"
        fill
        className="object-cover object-top md:object-left w-full h-full"
        priority
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px"
      />
    </section>



      {/* Product List */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Popular Products</h2>
            <Link href="/products" className="text-green-600 hover:text-orange-700 font-medium">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? [...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-0">
                      <div className="w-full h-64 bg-gray-200 rounded-t-lg"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              : products.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg">No products available</p>
                  </div>
                )
              : products.map((product) => (
                  <Card key={product.product_id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative">
                        <Image
                          src={convertGoogleDriveUrl(product.photo_url ?? null)}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full h-64 object-cover rounded-t-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg"
                          }}
                        />
                        
                        {/* Stock indicator */}
                        <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
                          Stock: {product.quantity}
                        </div>
                      </div>

                      <div className="p-4">
                        <Link href={`/product/${product.product_id}`}>
                          <h3 className="font-semibold text-gray-900 mb-2 hover:text-orange-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>

                        

                        {/* Description preview */}
                        {product.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">
                            Rp {product.price.toLocaleString("id-ID")}
                          </span>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            disabled={product.quantity === 0}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            {product.quantity === 0 ? "Out of Stock" : "Add"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Review Product</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
              name: "Melati",
              avatar: "/images/melati.jpeg",
              rating: 5,
              review:
                "Very beautiful woven fabric! Premium quality, lovely patterns, and bright colors. Very satisfied with this purchase.",
              },
              {
              name: "Angel",
              avatar: "/images/angel.jpeg",
              rating: 5,
              review: "Fast delivery, neat packaging. The woven fabric is very beautiful and of high quality!",
              },
              {
              name: "Rizqi",
              avatar: "/images/rizki.png",
              rating: 5,
              review: "Excellent service and the product met my expectations. Will buy again here!",
              },
            ].map((review, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                    <div className="w-12 h-12 mr-3 relative">
                      <Image
                      src={review.avatar}
                      alt={review.name}
                      fill
                      className="rounded-full object-cover"
                      style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-black">{review.name}</div>
                      <div className="flex items-center">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                      </div>
                    </div>
                    </div>
                  <p className="text-gray-600">{review.review}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-12" />
        </div>
      </section>     
      <BottomNavbar /> 
    </div>
  )
}