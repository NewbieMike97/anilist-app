import { useEffect, useState } from 'react'
import AnimeCard from '../components/AnimeCard'
import { fetchRecommendations } from '../lib/api'

export default function Recommendations({ genres, onBack, onOpenAuth }) {
  const [anime, setAnime] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    setAnime([])
    try {
      const json = await fetchRecommendations(genres)
      setAnime(json.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="text-sm text-slate-400 hover:text-violet-400 transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-violet-400">Recommendations</h2>
        <button
          onClick={load}
          disabled={loading}
          className="text-sm text-slate-400 hover:text-violet-400 disabled:opacity-40 transition-colors"
        >
          Refresh ↺
        </button>
      </div>

      {/* Genre tags */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {genres.map(g => (
          <span key={g} className="text-xs px-3 py-1 rounded-full bg-violet-900/40 text-violet-300 border border-violet-700/40">
            {g}
          </span>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-96 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-16">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={load} className="text-sm text-violet-400 hover:underline">
            Try again
          </button>
        </div>
      )}

      {/* Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {anime.map((item, i) => (
            <AnimeCard key={item.mal_id} anime={item} index={i} onOpenAuth={onOpenAuth} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && anime.length === 0 && (
        <p className="text-center text-slate-500 py-16">No results found. Try different genres.</p>
      )}
    </div>
  )
}
