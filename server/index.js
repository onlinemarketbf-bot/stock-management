const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./database/config');
const productRoutes = require('./routes/products');
const stockRoutes = require('./routes/stock');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Une erreur interne du serveur s\'est produite' 
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    const connected = await testConnection();
    
    if (!connected) {
      console.log('⚠️  Warning: Database connection failed. Server will start but database operations may fail.');
      console.log('💡 Please check your .env file and ensure MySQL is running.');
      console.log('💡 Run "npm run init-db" to initialize the database.');
    }
    
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🏪  Stock Management Application                    ║
║                                                        ║
║   Server running on: http://localhost:${PORT}           ║
║   API available at:  http://localhost:${PORT}/api      ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
