import React, { useState, useEffect } from 'react';

const API_URL = 'https://pharmacy-backend-poc.onrender.com';

const INITIAL_LEDGER = {
    monthKey: 'Sep-26',
    carryForward: 1433,
    collections: [],
    expenses: []
};

const ClubLedger = () => {
    const [availableMonths, setAvailableMonths] = useState(['Sep-26']);
    const [selectedMonth, setSelectedMonth] = useState('Sep-26');
    const [activeLedger, setActiveLedger] = useState(INITIAL_LEDGER);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [newMemberName, setNewMemberName] = useState('');
    const [expenseInput, setExpenseInput] = useState({ description: '', amount: '' });

    // Dynamic Totals
    const totalCollections = (activeLedger.collections || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpenses = (activeLedger.expenses || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const closingBalance = (Number(activeLedger.carryForward || 0) + totalCollections) - totalExpenses;

    useEffect(() => {
        fetchAvailableMonths();
    }, []);

    useEffect(() => {
        if (selectedMonth) {
            fetchLedgerByMonth(selectedMonth);
        }
    }, [selectedMonth]);

    const fetchAvailableMonths = async () => {
        try {
            const res = await fetch(`${API_URL}/ledger-months`);
            if (res.ok) {
                const months = await res.json();
                if (Array.isArray(months) && months.length > 0) {
                    setAvailableMonths(months);
                    setSelectedMonth(months[0]);
                }
            }
        } catch (err) {
            console.error('Failed to load month list:', err);
        }
    };

    const fetchLedgerByMonth = async (monthKey) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/ledger/${monthKey}`);
            if (res.ok) {
                const data = await res.json();
                setActiveLedger(data);
            }
        } catch (err) {
            console.error(`Error loading ledger for ${monthKey}:`, err);
        } finally {
            setLoading(false);
        }
    };

    // Prompt user for authentication password without revealing format
    const promptPasswordAndSave = async (ledgerPayload) => {
        const password = prompt("Enter admin authorization password:");
        if (!password) return false;

        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/ledger`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-admin-password': password.trim()
                },
                body: JSON.stringify(ledgerPayload)
            });
            
            if (res.status === 401) {
                alert('Invalid password! Changes were NOT saved.');
                return false;
            }

            if (res.ok) {
                const savedData = await res.json();
                setActiveLedger(savedData);
                alert(`Successfully authenticated & saved ${ledgerPayload.monthKey}!`);
                return true;
            } else {
                alert('Server returned an error while saving.');
            }
        } catch (err) {
            console.error('Save error:', err);
            alert('Could not connect to backend server.');
        } finally {
            setSaving(false);
        }
        return false;
    };

    const handleSaveClick = () => {
        promptPasswordAndSave(activeLedger);
    };

    const handleCarryForwardChange = (val) => {
        setActiveLedger(prev => ({ ...prev, carryForward: Number(val) }));
    };

    const handleCollectionChange = (id, field, value) => {
        const updatedCollections = (activeLedger.collections || []).map(item => {
            if (item.id === id) {
                return { ...item, [field]: field === 'amount' ? Number(value) : value };
            }
            return item;
        });
        setActiveLedger(prev => ({ ...prev, collections: updatedCollections }));
    };

    const handleAddMember = (e) => {
        e.preventDefault();
        if (!newMemberName.trim()) return;

        const newMember = {
            id: Date.now(),
            memberName: newMemberName.trim(),
            amount: 0,
            receivedBy: ''
        };

        setActiveLedger(prev => ({
            ...prev,
            collections: [...(prev.collections || []), newMember]
        }));
        setNewMemberName('');
    };

    const handleDeleteMember = (id, name) => {
        if (!window.confirm(`Remove "${name}"?`)) return;
        setActiveLedger(prev => ({
            ...prev,
            collections: (prev.collections || []).filter(item => item.id !== id)
        }));
    };

    const handleAddExpense = (e) => {
        e.preventDefault();
        if (!expenseInput.description || !expenseInput.amount) return;

        const newExpense = {
            id: Date.now(),
            description: expenseInput.description.trim(),
            amount: Number(expenseInput.amount)
        };

        setActiveLedger(prev => ({
            ...prev,
            expenses: [...(prev.expenses || []), newExpense]
        }));
        setExpenseInput({ description: '', amount: '' });
    };

    const handleDeleteExpense = (id, description) => {
        if (!window.confirm(`Delete expense "${description}"?`)) return;
        setActiveLedger(prev => ({
            ...prev,
            expenses: (prev.expenses || []).filter(item => item.id !== id)
        }));
    };

    const handleCreateNextMonth = async () => {
        const nextMonthKey = prompt(`Close ${selectedMonth} (Balance: ₹${closingBalance}) and create next month:`, "Oct-26");
        if (!nextMonthKey || !nextMonthKey.trim()) return;

        const cleanMonthKey = nextMonthKey.trim();

        const resetCollections = (activeLedger.collections || []).map((item, idx) => ({
            id: idx + 1,
            memberName: item.memberName,
            amount: 0,
            receivedBy: ''
        }));

        const newMonthLedger = {
            monthKey: cleanMonthKey,
            carryForward: closingBalance,
            collections: resetCollections,
            expenses: []
        };

        const success = await promptPasswordAndSave(newMonthLedger);
        if (success) {
            setAvailableMonths(prev => [...new Set([...prev, cleanMonthKey])]);
            setSelectedMonth(cleanMonthKey);
        }
    };

    return (
        <div style={{ maxWidth: '1050px', margin: '30px auto', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ border: '1px solid #ccc', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                
                {/* Header */}
                <div style={{ backgroundColor: '#102A45', color: '#fff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                        {selectedMonth} — Shuttlers Club Ledger
                    </div>
                    <button 
                        onClick={handleSaveClick} 
                        disabled={saving}
                        style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                    >
                        {saving ? 'Validating...' : '🔒 Authenticate & Save'}
                    </button>
                </div>

                <div style={{ padding: '20px' }}>
                    {/* Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', flexWrap: 'wrap', backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontWeight: 'bold' }}>Active Month:</label>
                            <select 
                                value={selectedMonth} 
                                onChange={(e) => setSelectedMonth(e.target.value)} 
                                style={{ padding: '6px 10px', fontSize: '14px', borderRadius: '4px' }}
                            >
                                {availableMonths.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div>
                                <label style={{ fontWeight: 'bold', marginRight: '6px' }}>Carry Forward (₹):</label>
                                <input
                                    type="number"
                                    value={activeLedger.carryForward || 0}
                                    onChange={(e) => handleCarryForwardChange(e.target.value)}
                                    style={{ width: '90px', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}
                                />
                            </div>

                            <button 
                                onClick={handleCreateNextMonth}
                                style={{ backgroundColor: '#ff9800', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Close Month & Roll Forward ➔
                            </button>
                        </div>
                    </div>

                    {/* Entry Forms */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <h4 style={{ color: '#102A45', marginBottom: '8px', marginTop: 0 }}>Add Member</h4>
                            <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Member Name" 
                                    value={newMemberName} 
                                    onChange={(e) => setNewMemberName(e.target.value)} 
                                    style={{ padding: '6px 10px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }} 
                                />
                                <button type="submit" style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '6px 14px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>
                                    + Add
                                </button>
                            </form>
                        </div>

                        <div>
                            <h4 style={{ color: '#102A45', marginBottom: '8px', marginTop: 0 }}>Add Expense</h4>
                            <form onSubmit={handleAddExpense} style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Expense Description" 
                                    value={expenseInput.description} 
                                    onChange={(e) => setExpenseInput({ ...expenseInput, description: e.target.value })} 
                                    style={{ padding: '6px 10px', flex: 2, borderRadius: '4px', border: '1px solid #ccc' }} 
                                />
                                <input 
                                    type="number" 
                                    placeholder="Amount" 
                                    value={expenseInput.amount} 
                                    onChange={(e) => setExpenseInput({ ...expenseInput, amount: e.target.value })} 
                                    style={{ padding: '6px 10px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }} 
                                />
                                <button type="submit" style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '6px 14px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>
                                    + Add
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Tables */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading Ledger Data...</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', borderTop: '2px solid #eee', paddingTop: '15px' }}>
                            <div>
                                <h4 style={{ marginTop: 0, color: '#28a745' }}>Collections</h4>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #ccc', backgroundColor: '#f2f2f2' }}>
                                            <th style={{ padding: '8px', textAlign: 'left' }}>#</th>
                                            <th style={{ padding: '8px', textAlign: 'left' }}>Member</th>
                                            <th style={{ padding: '8px', textAlign: 'right' }}>Amount (₹)</th>
                                            <th style={{ padding: '8px', textAlign: 'left' }}>Received By</th>
                                            <th style={{ padding: '8px', textAlign: 'center' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(!activeLedger.collections || activeLedger.collections.length === 0) ? (
                                            <tr><td colSpan="5" style={{ padding: '15px', textAlign: 'center', color: '#888' }}>No entries found</td></tr>
                                        ) : (
                                            activeLedger.collections.map((item, index) => (
                                                <tr key={item.id || index} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '8px' }}>{index + 1}</td>
                                                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{item.memberName}</td>
                                                    <td style={{ padding: '8px', textAlign: 'right' }}>
                                                        <input 
                                                            type="number" 
                                                            value={item.amount || ''} 
                                                            placeholder="0"
                                                            onChange={(e) => handleCollectionChange(item.id, 'amount', e.target.value)}
                                                            style={{ width: '75px', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '8px' }}>
                                                        <input 
                                                            type="text" 
                                                            value={item.receivedBy || ''} 
                                                            placeholder="Receiver"
                                                            onChange={(e) => handleCollectionChange(item.id, 'receivedBy', e.target.value)}
                                                            style={{ width: '85px', padding: '4px' }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                                        <button 
                                                            onClick={() => handleDeleteMember(item.id, item.memberName)}
                                                            style={{ backgroundColor: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div>
                                <h4 style={{ marginTop: 0, color: '#dc3545' }}>Expenses</h4>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #ccc', backgroundColor: '#f2f2f2' }}>
                                            <th style={{ padding: '8px', textAlign: 'left' }}>Description</th>
                                            <th style={{ padding: '8px', textAlign: 'right' }}>Amount (₹)</th>
                                            <th style={{ padding: '8px', textAlign: 'center' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#eef9f0' }}>
                                            <td style={{ padding: '8px', fontWeight: 'bold', color: 'green' }}>Total Collection</td>
                                            <td style={{ padding: '8px', textAlign: 'right', color: 'green', fontWeight: 'bold' }}>+₹{totalCollections}</td>
                                            <td></td>
                                        </tr>
                                        {(!activeLedger.expenses || activeLedger.expenses.length === 0) ? (
                                            <tr><td colSpan="3" style={{ padding: '15px', textAlign: 'center', color: '#888' }}>No expenses logged</td></tr>
                                        ) : (
                                            activeLedger.expenses.map((item) => (
                                                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '8px' }}>{item.description}</td>
                                                    <td style={{ padding: '8px', textAlign: 'right', color: '#dc3545', fontWeight: 'bold' }}>-₹{item.amount}</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                                        <button 
                                                            onClick={() => handleDeleteExpense(item.id, item.description)}
                                                            style={{ backgroundColor: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Footer Totals */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px', paddingTop: '15px', borderTop: '2px solid #102A45' }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                            Total Collections: <span style={{ color: 'green' }}>₹{totalCollections}</span> | Total Expenses: <span style={{ color: '#dc3545' }}>₹{totalExpenses}</span>
                        </div>
                        <div style={{ backgroundColor: '#007bff', color: '#fff', padding: '10px 20px', borderRadius: '4px', fontSize: '18px', fontWeight: 'bold' }}>
                            Closing Balance: ₹{closingBalance}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ClubLedger;