import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthModal from './components/AuthModal'
import GenrePicker from './pages/GenrePicker'
import Recommendations from './pages/Recommendations'
import Watchlist from './pages/Watchlist'
import Share from './pages/Share'
import PublicWatchlist from './pages/PublicWatchlist'

function Nav({ onOpenAuth }) {
  const { user, signOut } = useAuth()

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10">
      <Link to="/" className="text-xl font-bold text-violet-500 flex-shrink-0">AniList</Link>

      <div className="flex items-center gap-2 sm:gap-4 text-sm">
        <Link to="/" className="hidden sm:block hover:text-violet-400 transition-colors">Discover</Link>
        <Link to="/watchlist" className="hover:text-violet-400 transition-colors">Watchlist</Link>

        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden md:block text-slate-400 text-xs truncate max-w-[140px]">{user.email}</span>
            <button
              onClick={signOut}
              className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:border-white/30 text-xs transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
          >
            Sign in
          </button>
        )}
      </div>
    </nav>
  )
}

function SharePage() {
  const navigate = useNavigate()
  return <Share onBack={() => navigate('/watchlist')} />
}

function WatchlistPage({ onOpenAuth }) {
  const navigate = useNavigate()
  return <Watchlist onShare={() => navigate('/share')} onOpenAuth={onOpenAuth} />
}

function RecommendationsPage({ onOpenAuth }) {
  const navigate = useNavigate()
  const params = new URLSearchParams(window.location.search)
  const genres = (params.get('genres') || '').split(',').filter(Boolean)

  if (genres.length === 0) {
    navigate('/')
    return null
  }

  return <Recommendations genres={genres} onBack={() => navigate(-1)} onOpenAuth={onOpenAuth} />
}

function AppInner() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#0f0f14] text-slate-200">
      <Nav onOpenAuth={() => setAuthModalOpen(true)} />
      <main
        key={location.pathname}
        className="animate-page max-w-6xl mx-auto px-4 py-8"
      >
        <Routes>
          <Route path="/" element={<GenrePickerWrapper />} />
          <Route path="/recommendations" element={<RecommendationsPage onOpenAuth={() => setAuthModalOpen(true)} />} />
          <Route path="/watchlist" element={<WatchlistPage onOpenAuth={() => setAuthModalOpen(true)} />} />
          <Route path="/share" element={<SharePage />} />
          <Route path="/share/:token" element={<PublicWatchlist />} />
        </Routes>
      </main>
      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </div>
  )
}

function GenrePickerWrapper() {
  const navigate = useNavigate()
  return <GenrePicker onRecommend={(genres) => navigate(`/recommendations?genres=${genres.join(',')}`)} />
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
