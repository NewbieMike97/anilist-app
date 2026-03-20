import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { generateShareToken } from '../lib/api'

export default function Share({ onBack }) {
  const { user } = useAuth()
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  const shareUrl = token
    ? `${window.location.origin}/share/${token}`
    : null

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await generateShareToken()
      setToken(res.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!user) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-400">Sign in to share your watchlist.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto py-16">
      <button
        onClick={onBack}
        className="text-sm text-slate-400 hover:text-violet-400 transition-colors mb-8 block"
      >
        ← Back to watchlist
      </button>

      <h2 className="text-2xl font-bold text-violet-400 mb-2">Share your Watchlist</h2>
      <p className="text-slate-400 text-sm mb-8">
        Generate a public link so anyone can view your watchlist — no sign-in required.
      </p>

      {!token ? (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold transition-colors"
        >
          {loading ? 'Generating…' : 'Generate share link'}
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <span className="flex-1 text-sm text-slate-300 truncate">{shareUrl}</span>
            <button
              onClick={handleCopy}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-violet-600 hover:bg-violet-500 text-white'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Anyone with this link can view your watchlist. The link stays the same each time.
          </p>
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
    </div>
  )
}
