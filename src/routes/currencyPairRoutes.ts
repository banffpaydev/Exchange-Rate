import express from 'express';
import { createPair, getPairs, getPairById, updatePair, deletePair, getRecentRates, getRecentRawRates, getPaginatedPairs, getRemitOneSourceandDest } from '../controllers/currencyPairController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
// @ts-ignore
router.post('/pairs', authenticateToken, createPair);
router.get('/remitoneCountries', getRemitOneSourceandDest);
router.get('/pairs', getPairs);
router.get('/pairs/paginated', getPaginatedPairs);

router.get('/pairs/:id', getPairById);
// @ts-ignore
router.put('/pairs/:id', authenticateToken, updatePair);
// @ts-ignore
router.delete('/pairs/:id', authenticateToken, deletePair);
// @ts-ignore
router.get('/recentRates', getRecentRates);
// @ts-ignore
router.get('/recentRates/raw', getRecentRawRates);

export default router;