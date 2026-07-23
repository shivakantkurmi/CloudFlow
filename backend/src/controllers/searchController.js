import * as searchService from '../services/searchService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const globalSearch = asyncHandler(async (req, res) => {
  const query = req.query.q;
  const results = await searchService.globalSearch(query, req.auth);
  res.status(200).json({ success: true, data: results, message: 'Search completed.' });
});
