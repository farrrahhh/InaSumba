const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// --- Interfaces ---
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

export interface Weaver {
  weaver_id: string
  name: string
  bio?: string
  address?: string
  phone_number?: string
  specialization?: string[]
}

export interface Product {
  product_id: string
  name: string
  quantity: number
  price: number
  category: string
  description?: string
  meaning_motif?: string
  long_description?: string
  long_meaning_motif?: string
  video_url?: string
  photo_url?: string
  weaver_id: string
}

export interface Transaction {
  transaction_id: string
  user_id: string
  product_id: string
  product_name: string
  quantity: number
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

export interface QRISResponse {
  transaction_id: string
  qris_code: string
  total_amount: number
  product_name: string
}

export interface PaymentConfirmResponse {
  message: string
  transaction_id: string
  resi: string
  status: string
}

export interface TransactionData {
  transaction_id: string
  product_name: string
  resi?: string
  status: string
  address: string
  phone_number: string
  total_price: number
  transaction_date: string
}

export interface ProductWithWeaver extends Product {
  weaver: Weaver
}

export interface UpdateOrderStatusResponse {
  transaction_id: string
  status: string
  resi?: string
  message?: string
}

// --- API Calls ---
export const api = {
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products`)
    if (!response.ok) {
      throw new Error("Failed to fetch products")
    }
    return await response.json()
  },

  async getProduct(productId: string): Promise<ProductWithWeaver | null> {
    console.log('Fetching product:', productId);
    const response = await fetch(`${API_BASE_URL}/products/${productId}`)
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      if (response.status === 404) return null
      const errorData = await response.json().catch(() => ({}))
      console.error('API Error:', errorData);
      throw new Error(errorData.detail || "Failed to fetch product")
    }
    
    const data = await response.json();
    console.log('Product data received:', data);
    return data;
  },
  
  async createPurchase(buyRequest: BuyRequest): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/buy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buyRequest),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || "Failed to create purchase")
    }
    return await response.json()
  },

  async getPaymentDetails(transactionId: string): Promise<PaymentDetails> {
    const response = await fetch(`${API_BASE_URL}/payment/${transactionId}`)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || "Failed to fetch payment details")
    }
    return await response.json()
  },

  async generateQRIS(transactionId: string): Promise<QRISResponse> {
    const response = await fetch(`${API_BASE_URL}/payment/${transactionId}/qris`, {
      method: "POST",
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || "Failed to generate QRIS")
    }
    return await response.json()
  },

  async confirmPayment(transactionId: string): Promise<PaymentConfirmResponse> {
    const response = await fetch(`${API_BASE_URL}/payment/${transactionId}/confirm`, {
      method: "POST",
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || "Failed to confirm payment")
    }
    return await response.json()
  },

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE_URL}/transactions/user/${userId}`)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || "Failed to fetch user transactions")
    }
    return await response.json()
  },

  async trackOrder(transactionId: string): Promise<TransactionData> {
    const response = await fetch(`${API_BASE_URL}/track/${transactionId}`)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || "Failed to track order")
    }
    return await response.json()
  },

  async updateOrderStatus(transactionId: string, newStatus: string, resi?: string): Promise<UpdateOrderStatusResponse> {
    const body: Record<string, unknown> = { new_status: newStatus }
    if (resi) body.resi = resi

    const response = await fetch(`${API_BASE_URL}/orders/${transactionId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || "Failed to update order status")
    }
    return await response.json()
  },
}

// --- Translation ---
export async function translateText(
  sumbaText: string,
  targetLanguage: "en" | "id",
  userId?: string,
  context?: string
): Promise<TranslateResponse> {
  if (!sumbaText.trim()) throw new Error("Teks tidak boleh kosong")
  if (!userId && typeof window !== "undefined") {
    userId = localStorage.getItem("user_id") ?? undefined
  }

  const response = await fetch(`${API_BASE_URL}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

  return await response.json()
}

// --- Others ---
export async function getSupportedLanguages(): Promise<SupportedLanguagesResponse> {
  const response = await fetch(`${API_BASE_URL}/supported-languages`)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || "Failed to fetch supported languages")
  }
  return await response.json()
}

export async function checkApiHealth() {
  const response = await fetch(`${API_BASE_URL}/health`)
  if (!response.ok) throw new Error(`API health check failed: ${response.status}`)
  return await response.json()
}

// --- Utilities ---
export function validateTextLength(text: string, maxLength = 5000): boolean {
  return text.length <= maxLength
}

export function getLanguageDisplayName(code: "en" | "id"): string {
  return { id: "Bahasa Indonesia", en: "English" }[code]
}

export function formatProcessingTime(seconds: number): string {
  return seconds < 1 ? `${Math.round(seconds * 1000)}ms` : `${seconds.toFixed(2)}s`
}

export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("User not found")) return "Pengguna tidak ditemukan. Silakan login kembali."
    if (error.message.includes("Text is too long")) return "Teks terlalu panjang. Maksimal 5000 karakter."
    if (error.message.includes("OpenAI client is not properly configured")) return "Layanan terjemahan tidak tersedia."
    if (error.message.includes("Invalid target language")) return "Bahasa tujuan tidak valid."
    return error.message
  }
  return "Terjadi kesalahan yang tidak diketahui"
}