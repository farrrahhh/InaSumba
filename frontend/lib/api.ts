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