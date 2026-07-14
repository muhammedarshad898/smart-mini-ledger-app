require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const transactionRoutes = require('./routes/transactionRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Mini-Ledger API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/transactions', transactionRoutes);
app.use('/api/settings', settingsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
