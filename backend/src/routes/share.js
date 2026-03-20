import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase, createUserSupabase } from '../lib/supabase.js';

const router = Router();

// POST /api/share — return existing token or create a new one
router.post('/', requireAuth, async (req, res) => {
  const db = createUserSupabase(req.token);

  // Return existing token if one exists
  const { data: existing } = await db
    .from('share_tokens')
    .select('token')
    .eq('user_id', req.user.id)
    .single();

  if (existing) {
    return res.json({ token: existing.token });
  }

  const token = crypto.randomUUID();
  const { error } = await db
    .from('share_tokens')
    .insert({ user_id: req.user.id, token });

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ token });
});

// GET /api/share/:token — public, no auth
router.get('/:token', async (req, res) => {
  // Look up token (public read policy required on share_tokens)
  const { data: row, error: tokenErr } = await supabase
    .from('share_tokens')
    .select('user_id')
    .eq('token', req.params.token)
    .single();

  if (tokenErr || !row) {
    return res.status(404).json({ error: 'Share link not found' });
  }

  const userId = row.user_id;

  // Fetch watchlist + progress for that user (public read policies required)
  const [{ data: watchlist, error: wErr }, { data: progress, error: pErr }] = await Promise.all([
    supabase.from('watchlists').select('*').eq('user_id', userId).order('added_at', { ascending: false }),
    supabase.from('episode_progress').select('*').eq('user_id', userId),
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

export default router;
