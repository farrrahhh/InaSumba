"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart, Search, Filter, ArrowLeft } from "lucide-react"
import { api, type Product } from "@/lib/api"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [priceFilter, setPriceFilter] = useState<"all" | "low" | "medium" | "high">("all")
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high">("name")

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, searchQuery, priceFilter, sortBy])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await api.getProducts()
      setProducts(data)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortProducts = () => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Price filter
    if (priceFilter !== "all") {
      filtered = filtered.filter((product) => {
        if (priceFilter === "low") return product.price < 150000
        if (priceFilter === "medium") return product.price >= 150000 && product.price < 250000
        if (priceFilter === "high") return product.price >= 250000
        return true
      })
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "price-low") return a.price - b.price
      if (sortBy === "price-high") return b.price - a.price
      return 0
    })

    setFilteredProducts(filtered)
  }

  const getPriceRange = (price: number) => {
    if (price < 150000) return "Budget Friendly"
    if (price < 250000) return "Mid Range"
    return "Premium"
  }

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { text: "Out of Stock", color: "bg-red-100 text-red-800" }
    if (quantity < 5) return { text: "Low Stock", color: "bg-yellow-100 text-yellow-800" }
    return { text: "In Stock", color: "bg-green-100 text-green-800" }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/home" className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5" />
                <span className="text-2xl font-bold text-green-600">INASUMBA</span>
              </Link>
              <h1 className="text-lg font-semibold">All Products</h1>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/shop" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-black" />
              <span className="text-2xl font-bold text-green-600">INASUMBA</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        {/* Filters */}
        <div className="mb-8 space-y-4 bg-white">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-black placeholder-gray-400 bg-white"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Filters:</span>
            </div>

            {/* Price Filter */}
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Prices</option>
              <option value="low">Under Rp 150,000</option>
              <option value="medium">Rp 150,000 - 250,000</option>
              <option value="high">Above Rp 250,000</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? `No products match "${searchQuery}"` : "No products available with the selected filters"}
            </p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setPriceFilter("all")
                setSortBy("name")
              }}
              variant="outline"
              className="bg-transparent"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.quantity)
              return (
                <Card key={product.product_id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative">
                      <Image
                        src={product.photo_url || "/placeholder.svg?height=300&width=300&text=Product"}
                        alt={product.name}
                        width={300}
                        height={300}
                        className="w-full h-64 object-cover rounded-t-lg"
                      />

                      {/* Stock Badge */}
                      <Badge className={`absolute top-2 left-2 ${stockStatus.color}`}>{stockStatus.text}</Badge>

                      {/* Price Range Badge */}
                      <Badge variant="secondary" className="absolute top-2 right-2">
                        {getPriceRange(product.price)}
                      </Badge>

                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="p-4">
                      <Link href={`/product/${product.product_id}`}>
                        <h3 className="font-semibold text-gray-900 mb-2 hover:text-green-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>

                      {product.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                      )}

                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">(4.0)</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-gray-900">
                            Rp {product.price.toLocaleString("id-ID")}
                          </span>
                          <p className="text-xs text-gray-500">Stock: {product.quantity}</p>
                        </div>

                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={product.quantity === 0}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          {product.quantity === 0 ? "Sold Out" : "Add"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
