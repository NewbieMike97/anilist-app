import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createUserSupabase } from '../lib/supabase.js';

const router = Router();

// PUT /api/progress/:anime_id
router.put('/:anime_id', requireAuth, async (req, res) => {
  const anime_id = parseInt(req.params.anime_id, 10);
  const { episodes_watched, total_episodes } = req.body;

  if (episodes_watched === undefined) {
    return res.status(400).json({ error: 'episodes_watched is required' });
  }

  const clamped = Math.max(0, total_episodes
    ? Math.min(episodes_watched, total_episodes)
    : episodes_watched);

  const status =
    total_episodes && clamped >= total_episodes
      ? 'completed'
      : clamped > 0
        ? 'watching'
        : 'plan_to_watch';

  const db = createUserSupabase(req.token);

  const { error } = await db
    .from('episode_progress')
    .update({ episodes_watched: clamped, status, updated_at: new Date().toISOString() })
    .eq('anime_id', anime_id)
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ episodes_watched: clamped, status });
});

export default router;
