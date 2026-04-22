import { useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const useScan = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const scanText = async (text) => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.post(`${API_BASE}/api/scan`, { text })
      return response.data
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.')
      return null
    } finally {
      setLoading(false)
    }
  }

  const scanPDF = async (file) => {
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(`${API_BASE}/api/scan/pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      return response.data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to parse PDF.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { scanText, scanPDF, loading, error }
}

export default useScan
