const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', require('./routes/index'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ← THIS prints the real error to your terminal
app.use((err, req, res, next) => {
  console.error('🔴 SERVER ERROR:', err.message);
  console.error('🔴 STACK:', err.stack);
  res.status(500).json({ success: false, message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 PSG running on http://localhost:${PORT}`);
});