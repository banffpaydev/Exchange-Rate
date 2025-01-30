import rateRoutes from './routes/rateRoutes';
import userRoutes from './routes/userRoutes';
import currentPlay from './routes/currencyPairRoutes'
import cors from 'cors'
import { abokifxng, handleAllFetch, sendRate, xeRates } from './services/ExchangeRateService';
import { runAtInterval } from './services/jobs';
import { runCreateTables, seedCountries } from './services/currencyPairService';
import cron from 'node-cron';
import express, { Request, Response, NextFunction } from 'express';
import { errorHandler } from './middleware/errors';

// import momoRoutes from './routes/momoRoutes';

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: true }));


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
// Global Error-Handling Middleware
app.use(errorHandler);

// app.use('/api/momo', momoRoutes);

runAtInterval(handleAllFetch, 1000 * 60 * 60 * 2);//1000 * 5 * 2, 1000 * 7 * 2);//1000 * 60 * 90)
// runAtInterval(sendRate, 1000 * 60 * 60 * 2);//1000 * 5 * 2, 1000 * 7 * 2);//1000 * 60 * 90)
cron.schedule('0 8,14,20,2 * * *', () => {
  console.log("Sending rate at", new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
  sendRate();
});
// seedCountries()
runCreateTables();
// console.log(getInternalRates())

// Error handling
// app.use(errorHandler);

export default app;
