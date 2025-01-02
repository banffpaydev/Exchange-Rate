import express from 'express';
import rateRoutes from './routes/rateRoutes';
import userRoutes from './routes/userRoutes';
import currentPlay from './routes/currencyPairRoutes'
import cors from 'cors'
import { abokifxng, handleAllFetch, sendRate, xeRates } from './services/ExchangeRateService';
import { runAtInterval } from './services/jobs';
import { runCreateTables } from './services/currencyPairService';
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

runAtInterval(handleAllFetch, 1000 * 60 * 60 * 2);//1000 * 5 * 2, 1000 * 7 * 2);//1000 * 60 * 90)
runAtInterval(sendRate, 1000 * 60 * 60 * 2);//1000 * 5 * 2, 1000 * 7 * 2);//1000 * 60 * 90)

runCreateTables();

// Routes
app.use('/api/rates', rateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/current', currentPlay);

// app.use('/api/momo', momoRoutes);

// Error handling
// app.use(errorHandler);

export default app;
