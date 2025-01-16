import express from 'express';
import { createPair, getPairs, getPairById, updatePair, deletePair, getRecentRates, getRecentRawRates, getPaginatedPairs, getRemitOneSourceandDest } from '../controllers/currencyPairController';

const router = express.Router();

router.post('/pairs', createPair);
router.get('/remitoneCountries', getRemitOneSourceandDest);
router.get('/pairs', getPairs);
router.get('/pairs/paginated', getPaginatedPairs);

router.get('/pairs/:id', getPairById);
router.put('/pairs/:id', updatePair);
router.delete('/pairs/:id', deletePair);
// @ts-ignore
router.get('/recentRates', getRecentRates);
// @ts-ignore
router.get('/recentRates/raw', getRecentRawRates);

export default router;