import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchPublicWatchlist } from '../lib/api'

const STATUS_LABEL = {
  plan_to_watch: 'Plan to Watch',
  watching: 'Watching',
  completed: 'Completed',
}

const STATUS_COLOR = {
  plan_to_watch: 'bg-slate-700 text-slate-300',
  watching: 'bg-blue-900/60 text-blue-300',
  completed: 'bg-green-900/60 text-green-300',
}

export default function PublicWatchlist() {
  const { token } = useParams()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPublicWatchlist(token)
      .then(json => setEntries(json.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="py-8 max-w-2xl mx-auto">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-red-400 text-lg mb-2">Link not found</p>
        <p className="text-slate-500 text-sm">This share link may be invalid or expired.</p>
      </div>
    )
  }

  return (
    <div className="animate-page max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-violet-400">Shared Watchlist</h2>
        <p className="text-slate-500 text-sm mt-1">{entries.length} anime</p>
      </div>

      {entries.length === 0 && (
        <p className="text-slate-500 text-center py-16">This watchlist is empty.</p>
      )}

      <div className="space-y-4">
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            className="animate-card flex gap-4 bg-[#1a1a24] rounded-2xl border border-white/5 p-4 items-center"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {entry.anime_image_url && (
              <img
                src={entry.anime_image_url}
                alt={entry.anime_title}
                className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-100 leading-snug">{entry.anime_title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLOR[entry.status]}`}>
                  {STATUS_LABEL[entry.status]}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                {entry.episodes_watched} / {entry.total_episodes ?? '?'} episodes
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
