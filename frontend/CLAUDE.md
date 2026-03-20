# AniList App — Project Memory for Claude Code

## What this project is
An anime recommendation web app where users pick genres, get personalized anime recommendations
as cards with splash art, save anime to a watchlist, track episode progress, and share their
watchlist with others via a public link.

---

## Stack
- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js + Express
- **Database & Auth**: Supabase
- **Anime Data**: Jikan REST API v4 (https://api.jikan.moe/v4) — free, no API key needed

---

## Project Structure (expected)
```
/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── lib/     # supabase client, api helpers
├── server/          # Express backend
│   ├── routes/
│   └── index.js
├── CLAUDE.md        # this file
└── package.json
```

---

## App Screens

### 1. Genre Picker
- Multi-select genre tags: Shonen, Shojo, Seinen, Isekai, Action, Comedy, Romance, Horror,
  Mecha, Sports, Fantasy, Slice of Life
- "Get Recommendations" button → calls backend → Jikan API → returns 4-5 anime

### 2. Recommendation Cards
- 4-5 cards with staggered entrance animation (fade + slide)
- Each card: splash art (top half), title, synopsis (truncated), episodes, release year,
  animation studio, MAL score
- Hover: lift + glow effect
- "Add to Watchlist" button (requires auth — show login modal if not logged in)
- "Refresh" button for new results with same genres

### 3. Library / Watchlist (auth required)
- All saved anime with episode progress tracker
- +1 episode button + manual episode input
- Status badge: Plan to Watch / Watching / Completed (auto when episodes = total)
- Sort by: Date added, Title, Status

### 4. Share Watchlist
- Generate unique share token → public URL /share/:token
- Public read-only view (no auth required)
- Copy-to-clipboard button

---

## Supabase Tables

### watchlists
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | → auth.users |
| anime_id | integer | MAL ID from Jikan |
| anime_title | text | |
| anime_image_url | text | |
| total_episodes | integer | |
| added_at | timestamp | |

### episode_progress
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| anime_id | integer | |
| episodes_watched | integer | default 0 |
| status | text | 'plan_to_watch' / 'watching' / 'completed' |
| updated_at | timestamp | |

### share_tokens
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| token | text unique | |
| created_at | timestamp | |

---

## Backend Routes (Express)

| method | route | auth | description |
|---|---|---|---|
| GET | /api/recommendations?genres=action,comedy | no | Jikan search, returns 4-5 anime |
| GET | /api/anime/:id | no | Single anime detail from Jikan |
| POST | /api/watchlist | yes | Add anime to watchlist |
| GET | /api/watchlist | yes | Get user's full watchlist |
| DELETE | /api/watchlist/:id | yes | Remove from watchlist |
| PUT | /api/progress/:anime_id | yes | Update episode progress |
| POST | /api/share | yes | Generate share token |
| GET | /api/share/:token | no | Public watchlist by token |

---

## Design Guidelines
- Dark theme by default
- Font: Inter
- Accent color: purple/violet (#7C3AED)
- Card shadows + glow on hover
- Smooth transitions (Framer Motion or CSS)
- Mobile responsive

---

## Implementation Steps (track progress here)
- [ ] 1. Project skeleton — Vite + React + Tailwind + Express
- [ ] 2. Supabase setup — create tables, get env keys
- [ ] 3. Jikan integration on backend
- [ ] 4. Genre Picker + Recommendation Cards (no auth)
- [ ] 5. Supabase Auth (email/password or magic link)
- [ ] 6. Watchlist / Library screen
- [ ] 7. Share feature
- [ ] 8. Animations + mobile polish

## Current step
> Update this line as you progress so Claude Code always knows where you are.
> Example: "Completed steps 1-3. Currently working on step 4 — recommendation cards."

---

## Important notes
- Jikan rate limit: 3 requests/second — add a small delay on backend between calls
- Supabase env vars needed: SUPABASE_URL, SUPABASE_ANON_KEY (in .env, never commit)
- Always ask before proceeding to the next major step
- Keep components small and focused — one responsibility per file
