import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

async function authFetch(path, options = {}) {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export async function fetchRecommendations(genres) {
  const res = await fetch(`${BASE_URL}/api/recommendations?genres=${genres.join(',')}`)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

export const fetchWatchlist = () =>
  authFetch('/api/watchlist')

export const addToWatchlist = (anime) =>
  authFetch('/api/watchlist', {
    method: 'POST',
    body: JSON.stringify({
      anime_id: anime.mal_id,
      anime_title: anime.title,
      anime_image_url: anime.image_url,
      total_episodes: anime.episodes,
    }),
  })

export const removeFromWatchlist = (id) =>
  authFetch(`/api/watchlist/${id}`, { method: 'DELETE' })

export const updateProgress = (anime_id, episodes_watched, total_episodes) =>
  authFetch(`/api/progress/${anime_id}`, {
    method: 'PUT',
    body: JSON.stringify({ episodes_watched, total_episodes }),
  })

export const generateShareToken = () =>
  authFetch('/api/share', { method: 'POST' })

export async function fetchPublicWatchlist(token) {
  const res = await fetch(`${BASE_URL}/api/share/${token}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}
