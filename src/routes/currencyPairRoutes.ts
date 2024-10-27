import express from 'express';
import { createPair, getPairs, getPairById, updatePair, deletePair, getRecentRates } from '../controllers/currencyPairController';

const router = express.Router();

router.post('/pairs', createPair);
router.get('/pairs', getPairs);
router.get('/pairs/:id', getPairById);
router.put('/pairs/:id', updatePair);
router.delete('/pairs/:id', deletePair);
// @ts-ignore
router.get('/recentRates', getRecentRates);

export default router;