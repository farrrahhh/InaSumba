const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Updated response interface for the new API
export interface TranslateResponse {
  original_text: string
  translated_text: string
  source_language: string
  target_language: string
  confidence_score?: number
  cultural_notes?: string
  processing_time: number
}

export interface SupportedLanguagesResponse {
  supported_languages: Array<{
    code: string
    name: string
    native_name: string
    description: string
  }>
  source_language: {
    code: string
    name: string
    native_name: string
    description: string
  }
  max_text_length: number
}

// Main translation function
export async function translateText(
  sumbaText: string,
  targetLanguage: "en" | "id",
  userId = "3C69BD32",
  context?: string
): Promise<TranslateResponse> {
  if (!sumbaText.trim()) {
    throw new Error("Teks tidak boleh kosong")
  }

  const response = await fetch(`${API_BASE_URL}/translate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sumba_text: sumbaText.trim(),
      target_language: targetLanguage,
      user_id: userId,
      context: context || undefined,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Get supported languages
export async function getSupportedLanguages(): Promise<SupportedLanguagesResponse> {
  const response = await fetch(`${API_BASE_URL}/supported-languages`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Health check
export async function checkApiHealth() {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`API health check failed: ${response.status}`)
  }

  return response.json()
}

// Utility function to validate text length
export function validateTextLength(text: string, maxLength = 5000): boolean {
  return text.length <= maxLength
}

// Utility function to get language display name
export function getLanguageDisplayName(code: "en" | "id"): string {
  const names = {
    id: "Bahasa Indonesia",
    en: "English"
  }
  return names[code]
}

// Utility function to format processing time
export function formatProcessingTime(seconds: number): string {
  if (seconds < 1) {
    return `${Math.round(seconds * 1000)}ms`
  }
  return `${seconds.toFixed(2)}s`
}

// Error handler utility
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    // Handle specific API errors
    if (error.message.includes("User not found")) {
      return "Pengguna tidak ditemukan. Silakan login kembali."
    }
    if (error.message.includes("Text is too long")) {
      return "Teks terlalu panjang. Maksimal 5000 karakter."
    }
    if (error.message.includes("OpenAI client is not properly configured")) {
      return "Layanan terjemahan sedang tidak tersedia. Silakan coba lagi nanti."
    }
    if (error.message.includes("Invalid target language")) {
      return "Bahasa tujuan tidak valid."
    }
    return error.message
  }
  return "Terjadi kesalahan yang tidak diketahui"
}


export interface Product {
  product_id: string
  name: string
  quantity: number
  price: number
  description?: string
  video_url?: string
  photo_url?: string
}

export interface Transaction {
  transaction_id: string
  user_id: string
  product_id: string
  product_name: string
  address: string
  phone_number: string
  resi?: string
  total_price: number
  status: string
  transaction_date: string
}

export interface BuyRequest {
  user_id: string
  product_id: string
  address: string
  phone_number: string
}

export interface PaymentDetails {
  transaction_id: string
  product_name: string
  product_price: number
  shipping_cost: number
  total_price: number
  address: string
  phone_number: string
  status: string
}

// Frontend-specific interfaces
export interface TransactionData {
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
  paidAt?: string
  resi?: string
}

// Dummy fallback data
const dummyProducts: Product[] = [
  {
    product_id: "1",
    name: "Kain Tenun Sumba Motif Kuda",
    price: 250000,
    quantity: 10,
    description:
      "Kain tenun ikat Sumba yang dibuat dengan teknik tradisional turun temurun. Motif kuda melambangkan kekuatan dan keberanian dalam budaya Sumba.",
    photo_url: "/placeholder.svg?height=300&width=300&text=Kain+Tenun+Sumba",
  },
  {
    product_id: "2",
    name: "Tas Tenun Tradisional",
    price: 150000,
    quantity: 15,
    description: "Tas tenun dengan motif tradisional Sumba, cocok untuk berbagai acara formal maupun kasual.",
    photo_url: "/placeholder.svg?height=300&width=300&text=Tas+Tenun",
  },
  {
    product_id: "3",
    name: "Kerajinan Kayu Sumba",
    price: 180000,
    quantity: 8,
    description: "Kerajinan kayu ukir khas Sumba dengan motif tradisional yang indah dan berkualitas tinggi.",
    photo_url: "/placeholder.svg?height=300&width=300&text=Kerajinan+Kayu",
  },
  {
    product_id: "4",
    name: "Perhiasan Perak Tradisional",
    price: 320000,
    quantity: 5,
    description: "Perhiasan perak dengan desain tradisional Sumba, dibuat oleh pengrajin lokal berpengalaman.",
    photo_url: "/placeholder.svg?height=300&width=300&text=Perhiasan+Perak",
  },
  {
    product_id: "5",
    name: "Kopi Sumba Premium",
    price: 85000,
    quantity: 25,
    description: "Kopi premium dari dataran tinggi Sumba dengan cita rasa yang khas dan aroma yang harum.",
    photo_url: "/placeholder.svg?height=300&width=300&text=Kopi+Sumba",
  },
  {
    product_id: "6",
    name: "Madu Sumba Asli",
    price: 120000,
    quantity: 12,
    description: "Madu murni dari lebah hutan Sumba, kaya akan nutrisi dan memiliki khasiat kesehatan.",
    photo_url: "/placeholder.svg?height=300&width=300&text=Madu+Sumba",
  },
]

// Helper function to transform API Transaction to TransactionData
const transformTransaction = (apiTransaction: Transaction): TransactionData => {
  return {
    product: {
      id: apiTransaction.product_id,
      name: apiTransaction.product_name,
      price: apiTransaction.total_price - 10000, // Subtract shipping to get product price
    },
    quantity: 1, // Default quantity since API doesn't return this
    address: apiTransaction.address,
    phoneNumber: apiTransaction.phone_number,
    subtotal: apiTransaction.total_price - 10000,
    shipping: 10000,
    total: apiTransaction.total_price,
    transactionId: apiTransaction.transaction_id,
    status: apiTransaction.status,
    createdAt: apiTransaction.transaction_date,
    resi: apiTransaction.resi,
  }
}

// API functions with fallback
export const api = {
  // Get all products
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/products`)
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const products = await response.json()
      return products.length > 0 ? products : dummyProducts
    } catch (error) {
      console.warn("API call failed, using dummy data:", error)
      return dummyProducts
    }
  },

  // Get product by ID
  async getProduct(productId: string): Promise<Product | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch product")
      }
      return await response.json()
    } catch (error) {
      console.warn("API call failed, using dummy data:", error)
      return dummyProducts.find((p) => p.product_id === productId) || null
    }
  },

  // Create purchase transaction
  async createPurchase(buyRequest: BuyRequest): Promise<{ transaction_id: string; total_price: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/buy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buyRequest),
      })

      if (!response.ok) {
        throw new Error("Failed to create purchase")
      }

      return await response.json()
    } catch (error) {
      console.warn("API call failed, using dummy response:", error)
      // Dummy response for fallback
      const product = dummyProducts.find((p) => p.product_id === buyRequest.product_id)
      return {
        transaction_id: `TXN-${Date.now()}`,
        total_price: (product?.price || 0) + 10000, // Add shipping cost
      }
    }
  },

  // Get payment details
  async getPaymentDetails(transactionId: string): Promise<PaymentDetails> {
    try {
      const response = await fetch(`${API_BASE_URL}/payment/${transactionId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch payment details")
      }
      return await response.json()
    } catch (error) {
      console.warn("API call failed, using dummy data:", error)
      // Dummy response for fallback
      return {
        transaction_id: transactionId,
        product_name: "Kain Tenun Sumba Motif Kuda",
        product_price: 250000,
        shipping_cost: 10000,
        total_price: 260000,
        address: "Dummy Address",
        phone_number: "081234567890",
        status: "pending_payment",
      }
    }
  },

  // Generate QRIS payment
  async generateQRIS(transactionId: string): Promise<{ qris_code: string; total_amount: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payment/${transactionId}/qris`, {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Failed to generate QRIS")
      }
      return await response.json()
    } catch (error) {
      console.warn("API call failed, using dummy data:", error)
      return {
        qris_code: `QRIS-${transactionId}-${Date.now()}`,
        total_amount: 260000,
      }
    }
  },

  // Confirm payment
  async confirmPayment(transactionId: string): Promise<{ resi: string; status: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payment/${transactionId}/confirm`, {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Failed to confirm payment")
      }
      return await response.json()
    } catch (error) {
      console.warn("API call failed, using dummy data:", error)
      return {
        resi: `RESI-${Date.now()}`,
        status: "paid",
      }
    }
  },

  // Track order
  async trackOrder(transactionId: string): Promise<TransactionData> {
    try {
      const response = await fetch(`${API_BASE_URL}/track/${transactionId}`)
      if (!response.ok) {
        throw new Error("Failed to track order")
      }
      const apiTransaction: Transaction = await response.json()
      return transformTransaction(apiTransaction)
    } catch (error) {
      console.warn("API call failed, using dummy data:", error)
      return {
        transactionId: transactionId,
        product: {
          id: "1",
          name: "Kain Tenun Sumba Motif Kuda",
          price: 250000,
        },
        quantity: 1,
        address: "Jl. Dummy Address No. 123, Jakarta",
        phoneNumber: "081234567890",
        subtotal: 250000,
        shipping: 10000,
        total: 260000,
        status: "shipped",
        createdAt: new Date().toISOString().split("T")[0],
        resi: `RESI-${Date.now()}`,
      }
    }
  },
}
