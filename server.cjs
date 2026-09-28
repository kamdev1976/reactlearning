// server.cjs
const fs = require('fs');
const http = require('http');

const PORT = process.env.PORT || 8000;
const DB_FILE = './db.json';

const getDbData = () => {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    return { medicines: [], invoices: [], monthlyLedgers: [] };
  }
};

const saveDbData = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Helper function to generate valid dynamic password (ddmmyy + lowercase 3-letter weekday)
const getExpectedPassword = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const weekday = now.toLocaleString('en-US', { weekday: 'short' }).toLowerCase();
  
  return `${day}${month}${year}${weekday}`; // e.g., "280926mon"
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const db = getDbData();

  // GET / (Health Check)
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'Pharmacy & Club Ledger Backend API is running' }));
  }

  // GET /medicines
  else if (req.url === '/medicines' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.medicines || []));
  } 
  
  // GET /invoices
  else if (req.url === '/invoices' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.invoices || []));
  } 

  // GET /clubledger OR /ledger-months
  else if ((req.url === '/clubledger' || req.url === '/ledger-months') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (req.url === '/ledger-months') {
      const months = (db.monthlyLedgers || []).map(l => l.monthKey);
      res.end(JSON.stringify(months));
    } else {
      res.end(JSON.stringify(db.monthlyLedgers || []));
    }
  }

  // GET /clubledger/:monthKey OR /ledger/:monthKey
  else if ((req.url.startsWith('/clubledger/') || req.url.startsWith('/ledger/')) && req.method === 'GET') {
    const monthKey = req.url.split('/')[2];
    const ledger = (db.monthlyLedgers || []).find(l => l.monthKey === monthKey);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(ledger || { monthKey, carryForward: 0, collections: [], expenses: [] }));
  }

  // PROTECTED: POST/PUT /clubledger OR /ledger
  else if ((req.url === '/clubledger' || req.url === '/ledger') && (req.method === 'POST' || req.method === 'PUT')) {
    const providedPassword = req.headers['x-admin-password'];
    const expectedPassword = getExpectedPassword();

    if (!providedPassword || providedPassword.trim().toLowerCase() !== expectedPassword) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized: Invalid authentication password.' }));
      return;
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const payload = JSON.parse(body);
      if (!db.monthlyLedgers) db.monthlyLedgers = [];
      
      const idx = db.monthlyLedgers.findIndex(l => l.monthKey === payload.monthKey);
      if (idx >= 0) {
        db.monthlyLedgers[idx] = payload;
      } else {
        db.monthlyLedgers.push(payload);
      }

      saveDbData(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(payload));
    });
  }

  // 404 Fallback
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend Server running on port ${PORT}`);
});