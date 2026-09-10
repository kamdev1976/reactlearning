import React, { useState, useEffect } from 'react';

const API_URL = 'https://pharmacy-backend-poc.onrender.com';

const ClubLedger = () => {
  const [months, setMonths] = useState(['Sep-26']);
  const [selectedMonth, setSelectedMonth] = useState('Sep-26');
  const [newMonthInput, setNewMonthInput] = useState('');
  
  const [carryForward, setCarryForward] = useState(0);
  const [collections, setCollections] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Form Inputs
  const [member, setMember] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [receivedBy, setReceivedBy] = useState('');

  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');

  // Fetch available months
  const loadMonths = () => {
    fetch(`${API_URL}/ledger-months`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setMonths(data);
        }
      })
      .catch(err => console.error(err));
  };

  // Fetch data for selected month
  useEffect(() => {
    loadMonths();
    fetch(`${API_URL}/ledger/${selectedMonth}`)
      .then(res => res.json())
      .then(data => {
        setCarryForward(data.carryForward || 0);
        setCollections(data.collections || []);
        setExpenses(data.expenses || []);
      })
      .catch(err => console.error(err));
  }, [selectedMonth]);

  // Save changes to backend
  const saveLedger = (updatedCarry = carryForward, updatedCols = collections, updatedExps = expenses) => {
    const payload = {
      id: selectedMonth,
      monthKey: selectedMonth,
      carryForward: updatedCarry,
      collections: updatedCols,
      expenses: updatedExps
    };

    fetch(`${API_URL}/ledger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(() => loadMonths());
  };

  // Add Member Collection
  const handleAddCollection = (e) => {
    e.preventDefault();
    if (!member || !amountPaid) return;
    const newCol = { id: Date.now(), member, amountPaid: Number(amountPaid), receivedBy };
    const updated = [...collections, newCol];
    setCollections(updated);
    setMember(''); setAmountPaid(''); setReceivedBy('');
    saveLedger(carryForward, updated, expenses);
  };

  // Add Expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expDesc || !expAmount) return;
    const newExp = { id: Date.now(), description: expDesc, amount: Number(expAmount) };
    const updated = [...expenses, newExp];
    setExpenses(updated);
    setExpDesc(''); setExpAmount('');
    saveLedger(carryForward, collections, updated);
  };

  // Add New Dynamic Month
  const handleAddNewMonth = () => {
    if (!newMonthInput.trim()) return;
    const formatted = newMonthInput.trim();
    if (!months.includes(formatted)) {
      setMonths([...months, formatted]);
    }
    setSelectedMonth(formatted);
    setNewMonthInput('');
  };

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
        
        {/* Month Selector & New Month Add */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <label style={{ fontWeight: 'bold', marginRight: '8px' }}>Select Month:</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: '6px' }}>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <input 
              placeholder="e.g. Oct-26" 
              value={newMonthInput} 
              onChange={e => setNewMonthInput(e.target.value)}
              style={{ padding: '6px', marginRight: '6px' }}
            />
            <button onClick={handleAddNewMonth} style={{ padding: '6px 12px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              + Add Month
            </button>
          </div>

          <div>
            <strong>Carry Forward: </strong>
            <input
              type="number"
              value={carryForward}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCarryForward(val);
                saveLedger(val, collections, expenses);
              }}
              style={{ width: '100px', padding: '4px', textAlign: 'right' }}
            />
          </div>
        </div>

        {/* Input Forms */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', background: '#f8fafc', padding: '12px', borderRadius: '4px' }}>
          {/* Collection Input Form */}
          <form onSubmit={handleAddCollection} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <strong style={{ fontSize: '14px', color: '#0f2b5c' }}>Add New Collection Record</strong>
            <input placeholder="Member Name" value={member} onChange={e => setMember(e.target.value)} required style={{ padding: '6px' }} />
            <input placeholder="Amount Paid" type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} required style={{ padding: '6px' }} />
            <input placeholder="Received By" value={receivedBy} onChange={e => setReceivedBy(e.target.value)} style={{ padding: '6px' }} />
            <button type="submit" style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>+ Add Collection</button>
          </form>

          {/* Expense Input Form */}
          <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <strong style={{ fontSize: '14px', color: '#0f2b5c' }}>Add New Expenditure Record</strong>
            <input placeholder="Expense Description" value={expDesc} onChange={e => setExpDesc(e.target.value)} required style={{ padding: '6px' }} />
            <input placeholder="Amount" type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} required style={{ padding: '6px' }} />
            <button type="submit" style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', marginTop: 'auto' }}>+ Add Expense</button>
          </form>
        </div>

        {/* Data Tables */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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

        {/* Footer */}
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