// employee-portal/server.cjs
const fs = require('fs');
const http = require('http');

const PORT = 8000;
const DB_FILE = './db.json';

const getDbData = () => {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    return { medicines: [], invoices: [] };
  }
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const db = getDbData();

  // GET Requests
  if (req.url === '/medicines' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.medicines || []));
  } else if (req.url === '/invoices' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.invoices || []));
  } 
  
  // POST /medicines
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

  // POST /invoices
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
  
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Mock Backend Server listening on http://127.0.0.1:${PORT}`);
});