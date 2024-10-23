const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { handleError } = require('./utils/errorHandler');
const authRoutes = require('./routes/auth.routes');
const staffRoutes = require('./routes/staff.routes');
const menuRoutes = require('./routes/menu.routes');

const app = express();

// Middleware de seguridad
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/menu', menuRoutes);

// Error handling
app.use((err, req, res, next) => {
  handleError(err, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});