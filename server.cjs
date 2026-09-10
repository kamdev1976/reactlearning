// server.cjs
const fs = require('fs');
const http = require('http');

// Use Render's assigned environment PORT or default to 8000 for local development
const PORT = process.env.PORT || 8000;
const DB_FILE = './db.json';

// Helper function to read persistent data
const getDbData = () => {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    return { medicines: [], invoices: [] };
  }
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle Preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const db = getDbData();

  // GET / (Health Check Endpoint)
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'Pharmacy Backend API is running' }));
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
  
  // POST /medicines (Add New Medicine)
  else if (req.url === '/medicines' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const newMed = { id: Date.now().toString(), ...JSON.parse(body) };
      db.medicines = [newMed, ...(db.medicines || [])];
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newMed));
    });
  } 

  // POST /invoices (Create Invoice)
  else if (req.url === '/invoices' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const payload = JSON.parse(body);
      const newInv = {
        id: `INV-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toLocaleString(),
        ...payload
      };
      db.invoices = [newInv, ...(db.invoices || [])];
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newInv));
    });
  } 

  // PATCH /medicines/:id (Update Stock)
  else if (req.url.startsWith('/medicines/') && req.method === 'PATCH') {
    const medId = req.url.split('/')[2];
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const updates = JSON.parse(body);
      db.medicines = db.medicines.map(m => 
        String(m.id) === String(medId) ? { ...m, ...updates } : m
      );
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
  } 

  // GET /ledger-months (List all available months)
  else if (req.url === '/ledger-months' && req.method === 'GET') {
    const months = (db.monthlyLedgers || []).map(l => l.monthKey);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(months));
  }

  // GET /ledger/:monthKey
  else if (req.url.startsWith('/ledger/') && req.method === 'GET') {
    const monthKey = req.url.split('/')[2];
    const ledger = (db.monthlyLedgers || []).find(l => l.monthKey === monthKey);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(ledger || { monthKey, carryForward: 0, collections: [], expenses: [] }));
  }

  // POST /ledger (Save/Update Monthly Ledger)
  else if (req.url === '/ledger' && req.method === 'POST') {
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

      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(payload));
    });
  }
  // 404 Fallback for Unknown Routes
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
});

// Bind to 0.0.0.0 for Cloud Deployment (Render/Railway/Vercel)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock Backend Server listening on port ${PORT}`);
});