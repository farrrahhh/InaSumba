const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 

export interface ProfileResponse {
  user_id: string
  name: string
  email: string
}

export interface UpdateNameRequest {
  user_id: string
  new_name: string
}

export interface UpdatePasswordRequest {
  user_id: string
  old_password: string
  new_password: string
}

export async function getProfile(userId: string): Promise<ProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/profile/${userId}`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function updateName(data: UpdateNameRequest): Promise<ProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/profile/update-name`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function updatePassword(data: UpdatePasswordRequest): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/profile/update-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}
