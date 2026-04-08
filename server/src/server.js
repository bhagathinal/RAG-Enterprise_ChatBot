require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const policyRoutes = require('./routes/policy');
const hrRoutes = require('./routes/hr');

// Connect to Database
connectDB();

const app = express();

// Security and Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/hr', hrRoutes);

// App Health Check
app.get('/', (req, res) => res.json({ message: 'PolicyHub Unified API is operational' }));

// Global 404
app.use((req, res) => res.status(404).json({ message: 'Requested resource not found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  
  // Trigger automatic ingestion if DB is fresh
  const PolicyChunk = require('./models/PolicyChunk');
  const count = await PolicyChunk.countDocuments();
  if (count === 0) {
    const { ingestAllPdfs } = require('./services/ragService');
    console.log('📦 Database is empty. Starting initial PDF ingestion...');
    await ingestAllPdfs().catch(err => console.error('Ingestion process failed:', err));
  } else {
    console.log(`📚 Knowledge base active with ${count} content segments.`);
  }
});
