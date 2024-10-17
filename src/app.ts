import express from 'express';
import rateRoutes from './routes/rateRoutes';
import userRoutes from './routes/userRoutes';
import cors from 'cors'
// import momoRoutes from './routes/momoRoutes';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/rates', rateRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/momo', momoRoutes);

// Error handling
// app.use(errorHandler);

export default app;
