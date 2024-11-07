import express from 'express';
import rateRoutes from './routes/rateRoutes';
import userRoutes from './routes/userRoutes';
import currentPlay from './routes/currencyPairRoutes'
import cors from 'cors'
import { abokifxng, xeRates } from './services/ExchangeRateService';
// import momoRoutes from './routes/momoRoutes';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());


// async function getExchangeRate() {
//     const medium = await xeRates('ghs', 'ngn');
//     const mediumt = await xeRates('ngn', 'ghs');
//     console.log(medium, mediumt);
//   }
  
//   getExchangeRate();

// Routes
app.use('/api/rates', rateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/current', currentPlay);

// app.use('/api/momo', momoRoutes);

// Error handling
// app.use(errorHandler);

export default app;
