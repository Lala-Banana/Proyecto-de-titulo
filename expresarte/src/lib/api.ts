export const BASE_API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}