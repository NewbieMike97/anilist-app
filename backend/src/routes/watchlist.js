import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createUserSupabase } from '../lib/supabase.js';

const router = Router();

// GET /api/watchlist — fetch watchlist merged with episode progress
router.get('/', requireAuth, async (req, res) => {
  const db = createUserSupabase(req.token);

  const [{ data: watchlist, error: wErr }, { data: progress, error: pErr }] = await Promise.all([
    db.from('watchlists').select('*').eq('user_id', req.user.id).order('added_at', { ascending: false }),
    db.from('episode_progress').select('*').eq('user_id', req.user.id),
  ]);

  if (wErr || pErr) {
    return res.status(500).json({ error: wErr?.message || pErr?.message });
  }

  const progressMap = Object.fromEntries(progress.map(p => [p.anime_id, p]));

  const data = watchlist.map(entry => ({
    ...entry,
    episodes_watched: progressMap[entry.anime_id]?.episodes_watched ?? 0,
    status: progressMap[entry.anime_id]?.status ?? 'plan_to_watch',
  }));

  res.json({ data });
});

// POST /api/watchlist — add anime, create progress row
router.post('/', requireAuth, async (req, res) => {
  const { anime_id, anime_title, anime_image_url, total_episodes } = req.body;
  if (!anime_id || !anime_title) {
    return res.status(400).json({ error: 'anime_id and anime_title are required' });
  }

  const db = createUserSupabase(req.token);

  // Prevent duplicates
  const { data: existing } = await db
    .from('watchlists')
    .select('id')
    .eq('anime_id', anime_id)
    .single();

  if (existing) {
    return res.status(409).json({ error: 'Already in watchlist' });
  }

  const [{ error: wErr }, { error: pErr }] = await Promise.all([
    db.from('watchlists').insert({
      user_id: req.user.id,
      anime_id,
      anime_title,
      anime_image_url,
      total_episodes,
    }),
    db.from('episode_progress').insert({
      user_id: req.user.id,
      anime_id,
      episodes_watched: 0,
      status: 'plan_to_watch',
    }),
  ]);

  if (wErr || pErr) {
    return res.status(500).json({ error: wErr?.message || pErr?.message });
  }

  res.status(201).json({ message: 'Added to watchlist' });
});

// DELETE /api/watchlist/:id — remove entry and its progress row
router.delete('/:id', requireAuth, async (req, res) => {
  const db = createUserSupabase(req.token);

  // Get the anime_id first so we can delete progress too
  const { data: entry, error: fetchErr } = await db
    .from('watchlists')
    .select('anime_id')
    .eq('id', req.params.id)
    .single();

  if (fetchErr || !entry) {
    return res.status(404).json({ error: 'Watchlist entry not found' });
  }

  await Promise.all([
    db.from('watchlists').delete().eq('id', req.params.id),
    db.from('episode_progress').delete().eq('anime_id', entry.anime_id),
  ]);

  res.json({ message: 'Removed from watchlist' });
});

export default router;
