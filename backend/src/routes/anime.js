import { Router } from 'express';
import axios from 'axios';

const router = Router();

const JIKAN_BASE = 'https://api.jikan.moe/v4';

// GET /api/anime/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.get(`${JIKAN_BASE}/anime/${id}`);
    const item = response.data.data;

    res.json({
      data: {
        mal_id: item.mal_id,
        title: item.title_english || item.title,
        image_url: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
        synopsis: item.synopsis,
        episodes: item.episodes,
        year: item.year || item.aired?.prop?.from?.year,
        score: item.score,
        studios: item.studios?.map(s => s.name).join(', ') || 'Unknown',
      },
    });
  } catch (err) {
    const status = err.response?.status;
    if (status === 404) {
      return res.status(404).json({ error: 'Anime not found' });
    }
    if (status === 429) {
      return res.status(429).json({ error: 'Jikan rate limit hit — try again in a moment' });
    }
    console.error('Jikan error:', err.message);
    res.status(500).json({ error: 'Failed to fetch anime' });
  }
});

export default router;
