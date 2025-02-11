import express from 'express';
import { createPair, getPairs, getPairById, updatePair, deletePair, getRecentRates, getRecentRawRates, getPaginatedPairs, getRemitOneSourceandDest, calculateMulipleInternalRates, getSingleInternalRates, getAllInternalRates, updateInternalRates, getDbRateByPair, deleteInternalRate, uploadRate, updateMultiplePairs } from '../controllers/currencyPairController';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';
import { CustomError } from '../middleware/errors';

//multer config
export const upload = multer({
    dest: "tmp/csv",
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === "text/csv" ||
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
            cb(null, true); // Accept file
        } else {
            cb(new CustomError("Only CSV and Excel files are allowed!", 400)); // Reject file
        }
    },
});
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

router.delete('/internal', authenticateToken, deleteInternalRate);

router.get('/dbrate-by-Pair', getDbRateByPair);
// @ts-ignore
router.post("/upload-rates", upload.single("file"),authenticateToken, uploadRate);

// @ts-ignore
router.put('/update-internal', authenticateToken, updateInternalRates);

router.get('/pairs/paginated', getPaginatedPairs);

router.get('/pairs/:id', getPairById);
// @ts-ignore
router.put('/pairs/:id', authenticateToken, updatePair);

// @ts-ignore
router.put('/bulk-update-pair', authenticateToken, updateMultiplePairs);
// @ts-ignore
router.delete('/pairs/:id', authenticateToken, deletePair);
// @ts-ignore
router.get('/recentRates', getRecentRates);
// @ts-ignore
router.get('/recentRates/raw', getRecentRawRates);

export default router;