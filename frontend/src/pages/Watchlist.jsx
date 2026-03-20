import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchWatchlist, removeFromWatchlist, updateProgress } from '../lib/api'

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

const SORT_OPTIONS = [
  { value: 'added_at', label: 'Date added' },
  { value: 'anime_title', label: 'Title' },
  { value: 'status', label: 'Status' },
]

function EpisodeTracker({ entry, onChange }) {
  const [input, setInput] = useState(String(entry.episodes_watched))
  const [saving, setSaving] = useState(false)

  const save = async (value) => {
    const n = parseInt(value, 10)
    if (isNaN(n) || n === entry.episodes_watched) return
    setSaving(true)
    try {
      const result = await updateProgress(entry.anime_id, n, entry.total_episodes)
      onChange(entry.anime_id, result.episodes_watched, result.status)
    } finally {
      setSaving(false)
    }
  }

  const increment = () => {
    const next = entry.episodes_watched + 1
    setInput(String(next))
    save(next)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={increment}
        disabled={saving || (entry.total_episodes && entry.episodes_watched >= entry.total_episodes)}
        className="w-7 h-7 rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-bold transition-colors"
      >
        +
      </button>
      <input
        type="number"
        min="0"
        max={entry.total_episodes || undefined}
        value={input}
        onChange={e => setInput(e.target.value)}
        onBlur={e => save(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && save(input)}
        className="w-14 text-center bg-white/5 border border-white/10 rounded-lg text-sm text-slate-200 py-1 focus:outline-none focus:border-violet-500"
      />
      <span className="text-slate-500 text-sm">
        / {entry.total_episodes ?? '?'}
      </span>
    </div>
  )
}

export default function Watchlist({ onShare, onOpenAuth }) {
  const { user, loading: authLoading } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sort, setSort] = useState('added_at')

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }

    fetchWatchlist()
      .then(json => setEntries(json.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [user, authLoading])

  const handleProgressChange = (anime_id, episodes_watched, status) => {
    setEntries(prev =>
      prev.map(e => e.anime_id === anime_id ? { ...e, episodes_watched, status } : e)
    )
  }

  const handleRemove = async (id) => {
    await removeFromWatchlist(id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const STATUS_ORDER = { watching: 0, plan_to_watch: 1, completed: 2 }

  const sorted = [...entries].sort((a, b) => {
    if (sort === 'anime_title') return a.anime_title.localeCompare(b.anime_title)
    if (sort === 'status') return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    return new Date(b.added_at) - new Date(a.added_at)
  })

  // Not logged in
  if (!authLoading && !user) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-violet-400 mb-3">My Watchlist</h2>
        <p className="text-slate-400 mb-6">Sign in to save and track anime.</p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors"
        >
          Sign in
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold text-violet-400 mb-8">My Watchlist</h2>
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
      <div className="text-center py-24 text-red-400">{error}</div>
    )
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-violet-400">
          My Watchlist
          {entries.length > 0 && (
            <span className="ml-2 text-base font-normal text-slate-500">({entries.length})</span>
          )}
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-sm">Sort by</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-white/5 border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-violet-500"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value} className="bg-[#1a1a24] text-slate-200">{o.label}</option>
            ))}
          </select>
          {entries.length > 0 && (
            <button
              onClick={onShare}
              className="px-4 py-1.5 rounded-lg border border-violet-600 text-violet-400 hover:bg-violet-600 hover:text-white text-sm transition-colors"
            >
              Share →
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="text-center py-24 text-slate-500">
          <p className="text-lg mb-2">Nothing saved yet.</p>
          <p className="text-sm">Go to Discover, find some anime, and hit "+ Add to Watchlist".</p>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {sorted.map((entry, i) => (
          <div
            key={entry.id}
            className="animate-card flex gap-4 bg-[#1a1a24] rounded-2xl border border-white/5 p-4 items-start"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Thumbnail */}
            {entry.anime_image_url && (
              <img
                src={entry.anime_image_url}
                alt={entry.anime_title}
                className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
              />
            )}

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-100 leading-snug">{entry.anime_title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLOR[entry.status]}`}>
                  {STATUS_LABEL[entry.status]}
                </span>
              </div>

              <div className="mt-3">
                <EpisodeTracker entry={entry} onChange={handleProgressChange} />
              </div>
            </div>

            {/* Remove */}
            <button
              onClick={() => handleRemove(entry.id)}
              className="text-slate-600 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0 mt-0.5"
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
