const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'ECOLOOP API running' }));

// Initialize DB async, then mount routes
const { initDb } = require('./db/setup');

initDb().then(() => {
  // Routes
  app.use('/api/auth',         require('./routes/auth'));
  app.use('/api/lots',         require('./routes/lots'));
  app.use('/api/recyclers',    require('./routes/recyclers'));
  app.use('/api/transactions', require('./routes/transactions'));
  app.use('/api/prices',       require('./routes/prices'));
  app.use('/api/analytics',    require('./routes/analytics'));
  app.use('/api/users',        require('./routes/users'));
  app.use('/api/google',       require('./routes/google'));

  // Error Handling
  app.use(require('./middleware/errorHandler'));

  const server = app.listen(PORT, () => {
    console.log(`\n🌱 ECOLOOP Server running at http://localhost:${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api/health\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      fetch(`http://localhost:${PORT}/api/health`)
        .then(response => {
          if (response.ok) {
            console.log(`\nℹ️ ECOLOOP is already running on port ${PORT}. This server instance will exit cleanly.\n`);
            process.exit(0);
          }
          throw new Error('Port is occupied by another application.');
        })
        .catch(() => {
          console.error(`\n❌ Port ${PORT} is already in use by another application.\n`);
          process.exit(1);
        });
    } else {
      console.error('Server error:', err);
    }
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
