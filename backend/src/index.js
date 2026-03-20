import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import recommendationsRouter from './routes/recommendations.js';
import animeRouter from './routes/anime.js';
import watchlistRouter from './routes/watchlist.js';
import progressRouter from './routes/progress.js';
import shareRouter from './routes/share.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/recommendations', recommendationsRouter);
app.use('/api/anime', animeRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/progress', progressRouter);
app.use('/api/share', shareRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
