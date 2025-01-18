import app from './app';
import dotenv from 'dotenv';
import { handleAllFetch, removeRateKeyForAllPairs, sendRate, sendWaveRate } from './services/ExchangeRateService';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  // sendWaveRate("CAD", "NGN")
  // removeRateKeyForAllPairs("Twelve Data exchange")
  // removeRateKeyForAllPairs("xchangeRt exchange")
  // removeRateKeyForAllPairs("abokifxng")

  handleAllFetch()
  // sendRate()
  console.log(`Server is running on port ${PORT}`);
});
