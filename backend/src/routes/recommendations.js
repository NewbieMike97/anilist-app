import { Router } from 'express';
import axios from 'axios';

const router = Router();

const JIKAN_BASE = 'https://api.jikan.moe/v4';

// Map genre names (from frontend) to Jikan genre IDs
const GENRE_IDS = {
  action: 1,
  adventure: 2,
  comedy: 4,
  fantasy: 10,
  horror: 14,
  mecha: 18,
  romance: 22,
  'sci-fi': 24,
  shounen: 27,
  shonen: 27,
  shoujo: 25,
  shojo: 25,
  sports: 30,
  'slice of life': 36,
  'slice-of-life': 36,
  seinen: 42,
  isekai: 62,
};

// GET /api/recommendations?genres=action,comedy
router.get('/', async (req, res) => {
  const { genres } = req.query;

  if (!genres) {
    return res.status(400).json({ error: 'genres query param is required' });
  }

  const genreNames = genres.split(',').map(g => g.trim().toLowerCase());
  const genreIds = genreNames
    .map(name => GENRE_IDS[name])
    .filter(Boolean);

  if (genreIds.length === 0) {
    return res.status(400).json({ error: 'No valid genres provided' });
  }

  try {
    const response = await axios.get(`${JIKAN_BASE}/anime`, {
      params: {
        genres: genreIds.join(','),
        order_by: 'score',
        sort: 'desc',
        limit: 5,
        sfw: true,
      },
    });

    const anime = response.data.data.map(item => ({
      mal_id: item.mal_id,
      title: item.title_english || item.title,
      image_url: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
      synopsis: item.synopsis,
      episodes: item.episodes,
      year: item.year || item.aired?.prop?.from?.year,
      score: item.score,
      studios: item.studios?.map(s => s.name).join(', ') || 'Unknown',
    }));

    res.json({ data: anime });
  } catch (err) {
    const status = err.response?.status;
    if (status === 429) {
      return res.status(429).json({ error: 'Jikan rate limit hit — try again in a moment' });
    }
    console.error('Jikan error:', err.message);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

export default router;
