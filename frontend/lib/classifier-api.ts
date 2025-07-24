const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface ClassificationResponse {
  prediction: string
  confidence: number
  is_uncertain: boolean
  processing_time: number
  motif_analysis?: {
    title: string
    description: string
    symbolism: string[]
    cultural_context: string
    usage_occasions: string[]
  }
  probabilities: Record<string, number>
  recommendation?: string
  image_info: {
    format: string
    mode: string
    size: [number, number]
    width: number
    height: number
    file_size_bytes: number
    file_size_mb: number
  }
  timestamp: string
}

export interface MotifEncyclopedia {
  title: string
  description: string
  motifs: Record<string, string>
  cultural_background: string
  total_motifs: number
}

export interface ModelInfo {
  model_name: string
  version: string
  description: string
  supported_classes: string[]
  confidence_threshold: number
  input_requirements: {
    image_size: string
    supported_formats: string[]
    max_file_size: string
  }
  cultural_significance: Record<string, string>
}

export async function classifyTenun(
  file: File,
  userId = "3C69BD32",
  imageQualityNotes?: string,
): Promise<ClassificationResponse> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("user_id", userId)
  if (imageQualityNotes) {
    formData.append("image_quality_notes", imageQualityNotes)
  }

  const response = await fetch(`${API_BASE_URL}/classify-tenun`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function getModelInfo(): Promise<ModelInfo> {
  const response = await fetch(`${API_BASE_URL}/model-info`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function getMotifEncyclopedia(): Promise<MotifEncyclopedia> {
  const response = await fetch(`${API_BASE_URL}/motif-encyclopedia`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function healthCheck(): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/health`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}
