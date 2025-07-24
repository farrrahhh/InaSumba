const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export interface OCRTranslateResponse {
  extracted_text: string
  translated_text: string
  source_language: string
  target_language: string
  ocr_confidence?: number
  translation_confidence?: number
  cultural_notes?: string
  processing_time: {
    ocr_time: number
    translation_time: number
    total_time: number
  }
  image_dimensions: {
    width: number
    height: number
  }
}

export async function uploadAndTranslate(
  file: File,
  targetLanguage: "en" | "id",
  userId = "3C69BD32",
): Promise<OCRTranslateResponse> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("target_language", targetLanguage)
  formData.append("user_id", userId)

  const response = await fetch(`${API_BASE_URL}/ocr-translate-upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function translateText(
  text: string,
  targetLanguage: "en" | "id",
  userId = "3C69BD32"
): Promise<OCRTranslateResponse> {
  const response = await fetch(`${API_BASE_URL}/translate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sumba_text: text,
      target_language: targetLanguage,
      user_id: userId,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}
