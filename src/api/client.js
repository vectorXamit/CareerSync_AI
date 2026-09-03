import axios from 'axios'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
})

api.interceptors.request.use(async (config) => {
  if (!isSupabaseConfigured) return config
  try {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (err) {
    console.warn('Failed to attach auth token:', err.message)
  }
  return config
})

export async function syncUser() {
  try {
    if (!isSupabaseConfigured) return null
    const { data } = await supabase.auth.getSession()
    const session = data.session
    if (!session) return null
    const res = await api.post('/auth/sync', { email: session.user.email })
    return res.data
  } catch (err) {
    console.warn('syncUser failed (backend likely down):', err.message)
    return null
  }
}

export async function uploadResume(formData) {
  try {
    const res = await api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  } catch (err) {
    console.warn('uploadResume failed (backend likely down):', err.message)
    return null
  }
}

export async function getMe() {
  try {
    const res = await api.get('/auth/me')
    return res.data
  } catch (err) {
    console.warn('getMe failed (backend likely down):', err.message)
    return null
  }
}

export async function analyzeSkillGap(skills, targetRole) {
  try {
    const res = await api.post('/skill-gap/analyze', {
      skills,
      target_role: targetRole,
    })
    return res.data
  } catch (err) {
    console.warn('analyzeSkillGap failed:', err.message)
    return null
  }
}

export async function fetchInternships(skills, limit = 4) {
  try {
    const res = await api.get('/internships/recommend', {
      params: { skills: skills.join(','), limit },
    })
    const data = res.data
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.internships)) return data.internships
    return Array.isArray(data?.data) ? data.data : null
  } catch (err) {
    console.warn('fetchInternships failed:', err.message)
    return null
  }
}

export async function generateRoadmap(missingSkills, targetRole) {
  try {
    const res = await api.post('/roadmap/generate', {
      missing_skills: missingSkills,
      target_role: targetRole,
    })
    return res.data
  } catch (err) {
    console.warn('generateRoadmap failed:', err.message)
    return null
  }
}

export default api
