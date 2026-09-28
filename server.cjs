// server.cjs
const fs = require('fs');
const http = require('http');

// Use Render's assigned environment PORT or default to 8000 for local development
const PORT = process.env.PORT || 8000; //[cite: 7]
const DB_FILE = './db.json'; //[cite: 7]

// Helper function to read persistent data
const getDbData = () => {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); //[cite: 7]
  } catch (err) {
    return { medicines: [], invoices: [], monthlyLedgers: [] };
  }
};

// Helper function to write data
const saveDbData = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*'); //[cite: 7]
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); //[cite: 7]

  // Handle Preflight OPTIONS request
  if (req.method === 'OPTIONS') { //[cite: 7]
    res.writeHead(204); //[cite: 7]
    res.end(); //[cite: 7]
    return; //[cite: 7]
  }

  const db = getDbData(); //[cite: 7]

  // GET / (Health Check Endpoint)
  if (req.url === '/' && req.method === 'GET') { //[cite: 7]
    res.writeHead(200, { 'Content-Type': 'application/json' }); //[cite: 7]
    res.end(JSON.stringify({ status: 'Pharmacy & Club Ledger Backend API is running' }));
  }

  // ==========================================
  // MEDICINES & INVOICES ROUTES
  // ==========================================

  // GET /medicines
  else if (req.url === '/medicines' && req.method === 'GET') { //[cite: 7]
    res.writeHead(200, { 'Content-Type': 'application/json' }); //[cite: 7]
    res.end(JSON.stringify(db.medicines || [])); //[cite: 7]
  } 
  
  // GET /invoices
  else if (req.url === '/invoices' && req.method === 'GET') { //[cite: 7]
    res.writeHead(200, { 'Content-Type': 'application/json' }); //[cite: 7]
    res.end(JSON.stringify(db.invoices || [])); //[cite: 7]
  } 
  
  // POST /medicines
  else if (req.url === '/medicines' && req.method === 'POST') { //[cite: 7]
    let body = ''; //[cite: 7]
    req.on('data', chunk => body += chunk); //[cite: 7]
    req.on('end', () => { //[cite: 7]
      const newMed = { id: Date.now().toString(), ...JSON.parse(body) }; //[cite: 7]
      db.medicines = [newMed, ...(db.medicines || [])]; //[cite: 7]
      saveDbData(db);
      res.writeHead(201, { 'Content-Type': 'application/json' }); //[cite: 7]
      res.end(JSON.stringify(newMed)); //[cite: 7]
    });
  } 

  // POST /invoices
  else if (req.url === '/invoices' && req.method === 'POST') { //[cite: 7]
    let body = ''; //[cite: 7]
    req.on('data', chunk => body += chunk); //[cite: 7]
    req.on('end', () => { //[cite: 7]
      const payload = JSON.parse(body); //[cite: 7]
      const newInv = { //[cite: 7]
        id: `INV-${Date.now().toString().slice(-6)}`, //[cite: 7]
        createdAt: new Date().toLocaleString(), //[cite: 7]
        ...payload //[cite: 7]
      };
      db.invoices = [newInv, ...(db.invoices || [])]; //[cite: 7]
      saveDbData(db);
      res.writeHead(201, { 'Content-Type': 'application/json' }); //[cite: 7]
      res.end(JSON.stringify(newInv)); //[cite: 7]
    });
  } 

  // PATCH /medicines/:id
  else if (req.url.startsWith('/medicines/') && req.method === 'PATCH') { //[cite: 7]
    const medId = req.url.split('/')[2]; //[cite: 7]
    let body = ''; //[cite: 7]
    req.on('data', chunk => body += chunk); //[cite: 7]
    req.on('end', () => { //[cite: 7]
      const updates = JSON.parse(body); //[cite: 7]
      db.medicines = (db.medicines || []).map(m =>  //[cite: 7]
        String(m.id) === String(medId) ? { ...m, ...updates } : m //[cite: 7]
      );
      saveDbData(db);
      res.writeHead(200, { 'Content-Type': 'application/json' }); //[cite: 7]
      res.end(JSON.stringify({ success: true })); //[cite: 7]
    });
  } 

  // ==========================================
  // CLUB LEDGER ROUTES
  // ==========================================

  // GET /clubledger OR GET /ledger-months
  else if ((req.url === '/clubledger' || req.url === '/ledger-months') && req.method === 'GET') { //[cite: 7]
    res.writeHead(200, { 'Content-Type': 'application/json' }); //[cite: 7]
    // Return array of monthly ledger objects if requested via /clubledger, or list of keys if requested via /ledger-months
    if (req.url === '/ledger-months') {
      const months = (db.monthlyLedgers || []).map(l => l.monthKey); //[cite: 7]
      res.end(JSON.stringify(months)); //[cite: 7]
    } else {
      res.end(JSON.stringify(db.monthlyLedgers || []));
    }
  }

  // GET /clubledger/:monthKey OR GET /ledger/:monthKey
  else if ((req.url.startsWith('/clubledger/') || req.url.startsWith('/ledger/')) && req.method === 'GET') { //[cite: 7]
    const monthKey = req.url.split('/')[2]; //[cite: 7]
    const ledger = (db.monthlyLedgers || []).find(l => l.monthKey === monthKey); //[cite: 7]
    res.writeHead(200, { 'Content-Type': 'application/json' }); //[cite: 7]
    res.end(JSON.stringify(ledger || { monthKey, carryForward: 0, collections: [], expenses: [] })); //[cite: 7]
  }

  // POST or PUT /clubledger OR POST /ledger (Save/Update Monthly Ledger)
  else if ((req.url === '/clubledger' || req.url === '/ledger') && (req.method === 'POST' || req.method === 'PUT')) { //[cite: 7]
    let body = ''; //[cite: 7]
    req.on('data', chunk => body += chunk); //[cite: 7]
    req.on('end', () => { //[cite: 7]
      const payload = JSON.parse(body); //[cite: 7]
      if (!db.monthlyLedgers) db.monthlyLedgers = []; //[cite: 7]
      
      const idx = db.monthlyLedgers.findIndex(l => l.monthKey === payload.monthKey); //[cite: 7]
      if (idx >= 0) { //[cite: 7]
        db.monthlyLedgers[idx] = payload; //[cite: 7]
      } else {
        db.monthlyLedgers.push(payload); //[cite: 7]
      }

      saveDbData(db);
      res.writeHead(200, { 'Content-Type': 'application/json' }); //[cite: 7]
      res.end(JSON.stringify(payload)); //[cite: 7]
    });
  }

  // DELETE /clubledger/:monthKey
  else if (req.url.startsWith('/clubledger/') && req.method === 'DELETE') {
    const monthKey = req.url.split('/')[2];
    db.monthlyLedgers = (db.monthlyLedgers || []).filter(l => l.monthKey !== monthKey);
    saveDbData(db);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: `Deleted ledger month ${monthKey}` }));
  }

  // 404 Fallback for Unknown Routes
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' }); //[cite: 7]
    res.end(JSON.stringify({ error: 'Endpoint not found' })); //[cite: 7]
  }
});

// Bind to 0.0.0.0 for Cloud Deployment (Render/Railway/Vercel)
server.listen(PORT, '0.0.0.0', () => { //[cite: 7]
  console.log(`Mock Backend Server listening on port ${PORT}`); //[cite: 7]
});