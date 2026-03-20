import { useState } from 'react'

const GENRES = [
  'Shonen', 'Shojo', 'Seinen', 'Isekai',
  'Action', 'Comedy', 'Romance', 'Horror',
  'Mecha', 'Sports', 'Fantasy', 'Slice of Life',
]

export default function GenrePicker({ onRecommend }) {
  const [selected, setSelected] = useState([])

  const toggle = (genre) => {
    setSelected(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    )
  }

  const handleSubmit = () => {
    if (selected.length === 0) return
    onRecommend(selected.map(g => g.toLowerCase().replace(' ', '-')))
  }

  return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <h1 className="text-4xl font-bold text-violet-400 mb-2">Discover Anime</h1>
      <p className="text-slate-400 mb-10">Pick one or more genres to get personalized recommendations.</p>

      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {GENRES.map(genre => {
          const active = selected.includes(genre)
          return (
            <button
              key={genre}
              onClick={() => toggle(genre)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
                ${active
                  ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:border-violet-500/50 hover:text-violet-300'
                }`}
            >
              {genre}
            </button>
          )
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={selected.length === 0}
        className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-base transition-colors"
      >
        Get Recommendations
        {selected.length > 0 && (
          <span className="ml-2 text-violet-200 text-sm font-normal">
            ({selected.length} selected)
          </span>
        )}
      </button>
    </div>
  )
}
