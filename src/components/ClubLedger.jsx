import React, { useState, useEffect } from 'react';

const API_URL = 'https://pharmacy-backend-poc.onrender.com'; // Use http://localhost:8000 when testing locally

const ClubLedger = () => {
  const [selectedMonth, setSelectedMonth] = useState('Sep-26');
  const [carryForward, setCarryForward] = useState(1433);
  const [collections, setCollections] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch month data from backend on month selection change
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/ledger/${selectedMonth}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setCarryForward(data.carryForward || 0);
          setCollections(data.collections || []);
          setExpenses(data.expenses || []);
        } else {
          setCarryForward(0);
          setCollections([]);
          setExpenses([]);
        }
      })
      .catch((err) => console.error('Error loading ledger:', err))
      .finally(() => setLoading(false));
  }, [selectedMonth]);

  // Calculations
  const totalCollection = collections.reduce((sum, c) => sum + (Number(c.amountPaid) || 0), 0);
  const totalExpenditure = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netBalance = carryForward + totalCollection - totalExpenditure;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#0f2b5c', color: 'white', padding: '12px 20px', borderRadius: '4px 4px 0 0', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>
          {selectedMonth} — Shuttlers Club Collection & Expenditure Summary
        </h2>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '16px', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <label style={{ fontWeight: 'bold', marginRight: '8px' }}>Select Month:</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: '6px' }}>
              <option value="Aug-26">Aug-26</option>
              <option value="Sep-26">Sep-26</option>
              <option value="Oct-26">Oct-26</option>
            </select>
          </div>
          <div>
            <strong>Last month Balance carry forward: </strong>
            <input
              type="number"
              value={carryForward}
              onChange={(e) => setCarryForward(Number(e.target.value))}
              style={{ width: '100px', padding: '4px', textAlign: 'right' }}
            />
          </div>
        </div>

        {loading ? (
          <p>Loading ledger details...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Collections Table */}
            <div>
              <h4 style={{ margin: '0 0 8px 0', borderBottom: '2px solid #0f2b5c', paddingBottom: '4px' }}>Collections</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                    <th style={{ padding: '6px' }}>S.No</th>
                    <th style={{ padding: '6px' }}>Member</th>
                    <th style={{ padding: '6px', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '6px' }}>Received By</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((item, index) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '6px' }}>{index + 1}</td>
                      <td style={{ padding: '6px' }}>{item.member}</td>
                      <td style={{ padding: '6px', textAlign: 'right' }}>₹{item.amountPaid}</td>
                      <td style={{ padding: '6px' }}>{item.receivedBy || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Expenditures Table */}
            <div>
              <h4 style={{ margin: '0 0 8px 0', borderBottom: '2px solid #0f2b5c', paddingBottom: '4px' }}>Expenditures</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                    <th style={{ padding: '6px' }}>Description</th>
                    <th style={{ padding: '6px', textAlign: 'right' }}>Expenditure</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>
                    <td style={{ padding: '6px' }}>Total Collection</td>
                    <td style={{ padding: '6px', textAlign: 'right', color: '#16a34a' }}>₹{totalCollection.toLocaleString()}</td>
                  </tr>
                  {expenses.map((exp) => (
                    <tr key={exp.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '6px' }}>{exp.description}</td>
                      <td style={{ padding: '6px', textAlign: 'right', color: '#dc2626' }}>-₹{exp.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ marginTop: '24px', borderTop: '2px solid #0f2b5c', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            Total Collections: <span style={{ color: '#16a34a' }}>₹{totalCollection.toLocaleString()}</span>
          </div>
          <div style={{ background: '#0284c7', color: 'white', padding: '10px 20px', borderRadius: '4px', fontSize: '18px', fontWeight: 'bold' }}>
            Balance: ₹{netBalance.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubLedger;