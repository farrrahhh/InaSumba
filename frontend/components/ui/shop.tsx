"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ShoppingCart, Heart } from "lucide-react"
import { api, type Product } from "@/lib/api"

export function ShopMain() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await api.getProducts()
        setProducts(data.slice(0, 6))
      } catch (error) {
        console.error("Error loading products:", error)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-green-800 to-green-200 text-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-rusland">INASUMBA</h1>
            <p className="text-xl mb-6">
              Sumba's ikat woven fabric, which carries traces of culture, is now available in a style that is closer, more contemporary and friendlier.
            </p>
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm">📦</span>
                </div>
                <div>
                  <div className="font-semibold">Kain Tenun</div>
                  <div className="text-sm opacity-90">Authentic handwoven fabric</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm">🏪</span>
                </div>
                <div>
                  <div className="font-semibold">Marketplace</div>
                  <div className="text-sm opacity-90">Traditional products online</div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative bottom-0">
            <Image
              src="/sumba.png"
              alt="Traditional Sumba"
              width={600}
              height={400}
              className="bottom-0"
            />
          </div>
        </div>
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
              : products.map((product) => (
                  <Card key={product.product_id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative">
                        <Image
                          src={product.photo_url || "/placeholder.svg"}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full h-64 object-cover rounded-t-lg"
                        />
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="p-4">
                        <Link href={`/product/${product.product_id}`}>
                          <h3 className="font-semibold text-gray-900 mb-2 hover:text-orange-600 transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">
                            Rp {product.price.toLocaleString("id-ID")}
                          </span>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Add
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
                name: "Bagus",
                avatar: "/placeholder.svg?height=50&width=50&text=B",
                rating: 5,
                review:
                  "Kain tenun yang sangat bagus! Kualitas premium, motif cantik, warna cerah. Sangat puas dengan pembelian ini.",
              },
              {
                name: "Sarina",
                avatar: "/placeholder.svg?height=50&width=50&text=S",
                rating: 5,
                review: "Pengiriman cepat, packaging rapi. Kain tenunnya sangat indah dan berkualitas tinggi!",
              },
              {
                name: "Heru",
                avatar: "/placeholder.svg?height=50&width=50&text=H",
                rating: 5,
                review: "Pelayanan sangat baik dan produk sesuai ekspektasi. Akan beli lagi di sini!",
              },
            ].map((review, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Image
                      src={review.avatar}
                      alt={review.name}
                      width={50}
                      height={50}
                      className="rounded-full mr-3"
                    />
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
        </div>
      </section>      
    </div>
  )
}
