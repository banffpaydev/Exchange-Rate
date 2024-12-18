import app from './app';
import dotenv from 'dotenv';
import { handleAllFetch } from './services/ExchangeRateService';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  handleAllFetch()
  console.log(`Server is running on port ${PORT}`);
});
