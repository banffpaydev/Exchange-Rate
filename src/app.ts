import rateRoutes from './routes/rateRoutes';
import userRoutes from './routes/userRoutes';
import currentPlay from './routes/currencyPairRoutes'
import cors from 'cors'
import { abokifxng, handleAllFetch, sendRate, sendRateToPartners, transporter, xeRates } from './services/ExchangeRateService';
import { runAtInterval } from './services/jobs';
import { runCreateTables, seedCountries } from './services/currencyPairService';
import cron from 'node-cron';
import express, { Request, Response, NextFunction } from 'express';
import { errorHandler } from './middleware/errors';
import axios from 'axios';
import nodemailer from 'nodemailer';

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
app.get('/test', (req: Request, res: Response) => {
  res.json({ success: true });
});
app.use('/api/rates', rateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/current', currentPlay);
// Global Error-Handling Middleware
app.use(errorHandler);

// app.use('/api/momo', momoRoutes);

// runAtInterval(handleAllFetch, 1000 * 60 * 60 * 2);//1000 * 5 * 2, 1000 * 7 * 2);//1000 * 60 * 90)
// runAtInterval(sendRate, 1000 * 60 * 60 * 2);//1000 * 5 * 2, 1000 * 7 * 2);//1000 * 60 * 90)
cron.schedule('0 8,14,20,2 * * *', async () => {
  async function checkServerStatus() {
    try {
      const response = await axios.get('https://www.api-exchange.bpay.africa/test');
      if (response.status === 200) {
        console.log('Server is active');
      }
    } catch (error) {
      console.error('Server is down, sending email...');
      sendEmailNotification();
    }
  }

  function sendEmailNotification() {

    const mailOptions = {
      from: `Exchange@bpay.africa`,
      to: ["olamidedavid10@gmail.com", "dharold@bpay.africa", "pm@bpay.africa"],
      subject: 'Server Down Alert',
      text: 'The server at https://www.api-exchange.bpay.africa is down.'
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Email sent: ' + info.response);
    });
  }

  // await checkServerStatus();
  console.log("Sending rate at", new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
  await  handleAllFetch()
  await sendRate();
});

cron.schedule('0 9 * * *', async () => {
 
  // await checkServerStatus();
  console.log("Sending rate to partners at", new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
 
  await sendRateToPartners()
});
// seedCountries()
runCreateTables();
// console.log(getInternalRates())

// Error handling
// app.use(errorHandler);

export default app;
