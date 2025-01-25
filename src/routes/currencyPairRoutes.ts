import express from 'express';
import { createPair, getPairs, getPairById, updatePair, deletePair, getRecentRates, getRecentRawRates, getPaginatedPairs, getRemitOneSourceandDest, calculateMulipleInternalRates, getSingleInternalRates, getAllInternalRates, updateInternalRates, getDbRateByPair, deleteInternalRate } from '../controllers/currencyPairController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
// @ts-ignore
router.post('/pairs', authenticateToken, createPair);
router.get('/remitoneCountries', getRemitOneSourceandDest);
router.get('/pairs', getPairs);
// @ts-ignore
router.post('/calculate-internal', authenticateToken, calculateMulipleInternalRates);
// @ts-ignore
router.get('/get-all-internal', getAllInternalRates);

// @ts-ignore
router.get('/get-internal', getSingleInternalRates);
// @ts-ignore

router.delete('/internal',authenticateToken, deleteInternalRate);

router.get('/dbrate-by-Pair', getDbRateByPair);


// @ts-ignore
router.put('/update-internal', authenticateToken, updateInternalRates);

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