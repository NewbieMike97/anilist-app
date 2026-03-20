import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { addToWatchlist } from '../lib/api'

export default function AnimeCard({ anime, index, onOpenAuth }) {
  const { user } = useAuth()
  const [state, setState] = useState('idle') // 'idle' | 'loading' | 'added' | 'duplicate' | 'error'

  const handleAdd = async () => {
    if (!user) {
      onOpenAuth?.()
      return
    }
    setState('loading')
    try {
      await addToWatchlist(anime)
      setState('added')
    } catch (err) {
      setState(err.message === 'Already in watchlist' ? 'duplicate' : 'error')
      setTimeout(() => setState('idle'), 3000)
    }
  }

  const buttonLabel = {
    idle: '+ Add to Watchlist',
    loading: 'Adding…',
    added: '✓ Added',
    duplicate: 'Already saved',
    error: 'Error — retry?',
  }[state]

  const buttonClass = {
    idle: 'bg-violet-600 hover:bg-violet-500 active:bg-violet-700',
    loading: 'bg-violet-600 opacity-60 cursor-not-allowed',
    added: 'bg-green-600 cursor-default',
    duplicate: 'bg-slate-600 cursor-default',
    error: 'bg-red-600 hover:bg-red-500',
  }[state]

  return (
    <div
      className="animate-card relative flex flex-col bg-[#1a1a24] rounded-2xl overflow-hidden border border-white/5 hover:border-violet-500/40 hover:shadow-[0_0_24px_rgba(124,58,237,0.25)] hover:-translate-y-1 transition-all duration-300"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Splash art */}
      <div className="relative h-56 bg-[#12121a] overflow-hidden">
        {anime.image_url ? (
          <img
            src={anime.image_url}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">
            No image
          </div>
        )}
        {anime.score && (
          <span className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
            ★ {anime.score}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-semibold text-slate-100 leading-snug line-clamp-2">
          {anime.title}
        </h3>

        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 flex-1">
          {anime.synopsis || 'No synopsis available.'}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
          {anime.episodes && <span>{anime.episodes} eps</span>}
          {anime.year && <span>{anime.year}</span>}
          {anime.studios && <span>{anime.studios}</span>}
        </div>

        <button
          onClick={handleAdd}
          disabled={state === 'loading' || state === 'added' || state === 'duplicate'}
          className={`mt-3 w-full py-2 rounded-lg text-white text-sm font-medium transition-colors ${buttonClass}`}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}
