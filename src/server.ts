import app from './app';
import dotenv from 'dotenv';
import { handleAllFetch, sendRate } from './services/ExchangeRateService';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => { 
  // handleAllFetch()
  // sendRate()
  console.log(`Server is running on port ${PORT}`);
});
