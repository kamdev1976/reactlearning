import React, { useState } from 'react';

const ClubLedger = () => {
    const [selectedMonth, setSelectedMonth] = useState('Sep-26');
    const [newMonthInput, setNewMonthInput] = useState('');

    // Dynamic store holding data for all months
    const [monthlyData, setMonthlyData] = useState({
        'Sep-26': {
            carryForward: 1433,
            collections: [],
            expenditures: []
        }
    });

    // Form inputs state
    const [memberInput, setMemberInput] = useState({ name: '', amount: '', receivedBy: '' });
    const [expenseInput, setExpenseInput] = useState({ description: '', amount: '' });

    // Retrieve active month data dynamically
    const activeData = monthlyData[selectedMonth] || { carryForward: 0, collections: [], expenditures: [] };
    const carryForward = activeData.carryForward || 0;
    const collections = activeData.collections || [];
    const expenditures = activeData.expenditures || [];

    // Totals calculated directly from active month's state
    const totalCollections = collections.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpenditures = expenditures.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const finalBalance = (Number(carryForward) + totalCollections) - totalExpenditures;

    // Helper to update active month's data in the state object
    const updateActiveMonthData = (updatedFields) => {
        setMonthlyData(prev => ({
            ...prev,
            [selectedMonth]: {
                ...prev[selectedMonth],
                ...updatedFields
            }
        }));
    };

    // 1. Add Month manually
    const handleAddMonth = () => {
        const monthToAdd = newMonthInput.trim();
        if (!monthToAdd) return alert('Enter a month name (e.g. Oct-26)');
        if (monthlyData[monthToAdd]) return alert('Month already exists!');

        setMonthlyData(prev => ({
            ...prev,
            [monthToAdd]: { carryForward: 0, collections: [], expenditures: [] }
        }));
        setSelectedMonth(monthToAdd);
        setNewMonthInput('');
    };

    // 2. Change Carry Forward for active month
    const handleCarryForwardChange = (val) => {
        updateActiveMonthData({ carryForward: Number(val) });
    };

    // 3. Add Collection record to active month
    const handleAddCollection = (e) => {
        e.preventDefault();
        if (!memberInput.name || !memberInput.amount) return;

        const newRecord = {
            id: Date.now(),
            name: memberInput.name,
            amount: Number(memberInput.amount),
            receivedBy: memberInput.receivedBy || '-'
        };

        updateActiveMonthData({ collections: [...collections, newRecord] });
        setMemberInput({ name: '', amount: '', receivedBy: '' });
    };

    // 4. Add Expenditure record to active month
    const handleAddExpense = (e) => {
        e.preventDefault();
        if (!expenseInput.description || !expenseInput.amount) return;

        const newRecord = {
            id: Date.now(),
            description: expenseInput.description,
            amount: Number(expenseInput.amount)
        };

        updateActiveMonthData({ expenditures: [...expenditures, newRecord] });
        setExpenseInput({ description: '', amount: '' });
    };

    // 5. Close month and transfer balance to Next Month
    const handleTransitionMonth = () => {
        const confirmMsg = `Close ${selectedMonth} and transition net balance ₹${finalBalance} to the next month?`;
        if (!window.confirm(confirmMsg)) return;

        const nextMonthLabel = prompt("Enter next month name:", "Oct-26");
        if (!nextMonthLabel) return;

        setMonthlyData(prev => ({
            ...prev,
            // Next month starts with calculated net balance as Carry Forward and empty collections/expenses
            [nextMonthLabel]: {
                carryForward: finalBalance,
                collections: [],
                expenditures: []
            }
        }));

        setSelectedMonth(nextMonthLabel);
    };

    return (
        <div style={{ maxWidth: '1050px', margin: '30px auto', fontFamily: 'sans-serif' }}>
            <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
                
                {/* Dynamic Title */}
                <div style={{ backgroundColor: '#102A45', color: '#fff', textAlign: 'center', padding: '12px', fontSize: '18px', fontWeight: 'bold' }}>
                    {selectedMonth} — Shuttlers Club Collection & Expenditure Summary
                </div>

                <div style={{ padding: '20px' }}>
                    {/* Control Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontWeight: 'bold' }}>Select Month:</label>
                            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: '4px 8px' }}>
                                {Object.keys(monthlyData).map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="e.g. Oct-26"
                                value={newMonthInput}
                                onChange={(e) => setNewMonthInput(e.target.value)}
                                style={{ padding: '4px 8px', width: '100px' }}
                            />
                            <button onClick={handleAddMonth} style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
                                + Add Month
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div>
                                <label style={{ fontWeight: 'bold', marginRight: '5px' }}>Carry Forward:</label>
                                <input
                                    type="number"
                                    value={carryForward}
                                    onChange={(e) => handleCarryForwardChange(e.target.value)}
                                    style={{ width: '80px', padding: '4px', textAlign: 'right' }}
                                />
                            </div>

                            <button 
                                onClick={handleTransitionMonth}
                                style={{ backgroundColor: '#ff9800', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Close & Move to Next Month ➔
                            </button>
                        </div>
                    </div>

                    {/* Input Forms */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                        <div>
                            <h4 style={{ color: '#102A45', marginBottom: '8px', marginTop: 0 }}>Add New Collection Record</h4>
                            <form onSubmit={handleAddCollection} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input type="text" placeholder="Member Name" value={memberInput.name} onChange={(e) => setMemberInput({ ...memberInput, name: e.target.value })} style={{ padding: '6px' }} />
                                <input type="number" placeholder="Amount Paid" value={memberInput.amount} onChange={(e) => setMemberInput({ ...memberInput, amount: e.target.value })} style={{ padding: '6px' }} />
                                <input type="text" placeholder="Received By" value={memberInput.receivedBy} onChange={(e) => setMemberInput({ ...memberInput, receivedBy: e.target.value })} style={{ padding: '6px' }} />
                                <button type="submit" style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '8px', fontWeight: 'bold', borderRadius: '3px', cursor: 'pointer' }}>
                                    + Add Collection
                                </button>
                            </form>
                        </div>

                        <div>
                            <h4 style={{ color: '#102A45', marginBottom: '8px', marginTop: 0 }}>Add New Expenditure Record</h4>
                            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input type="text" placeholder="Expense Description" value={expenseInput.description} onChange={(e) => setExpenseInput({ ...expenseInput, description: e.target.value })} style={{ padding: '6px' }} />
                                <input type="number" placeholder="Amount" value={expenseInput.amount} onChange={(e) => setExpenseInput({ ...expenseInput, amount: e.target.value })} style={{ padding: '6px' }} />
                                <button type="submit" style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '8px', fontWeight: 'bold', borderRadius: '3px', cursor: 'pointer' }}>
                                    + Add Expense
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Data Tables */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        <div>
                            <h4 style={{ marginTop: 0 }}>Collections</h4>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                                        <th style={{ padding: '6px' }}>S.No</th>
                                        <th style={{ padding: '6px' }}>Member</th>
                                        <th style={{ padding: '6px', textAlign: 'right' }}>Amount</th>
                                        <th style={{ padding: '6px' }}>Received By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {collections.length === 0 ? (
                                        <tr><td colSpan="4" style={{ padding: '10px', textAlign: 'center', color: '#888' }}>No collections recorded</td></tr>
                                    ) : (
                                        collections.map((item, index) => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '6px' }}>{index + 1}</td>
                                                <td style={{ padding: '6px' }}>{item.name}</td>
                                                <td style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>₹{item.amount}</td>
                                                <td style={{ padding: '6px' }}>{item.receivedBy}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <h4 style={{ marginTop: 0 }}>Expenditures</h4>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                                        <th style={{ padding: '6px' }}>Description</th>
                                        <th style={{ padding: '6px', textAlign: 'right' }}>Expenditure</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '6px', fontWeight: 'bold' }}>Total Collection</td>
                                        <td style={{ padding: '6px', textAlign: 'right', color: 'green', fontWeight: 'bold' }}>₹{totalCollections}</td>
                                    </tr>
                                    {expenditures.length === 0 ? (
                                        <tr><td colSpan="2" style={{ padding: '10px', textAlign: 'center', color: '#888' }}>No expenses recorded</td></tr>
                                    ) : (
                                        expenditures.map((item) => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '6px' }}>{item.description}</td>
                                                <td style={{ padding: '6px', textAlign: 'right', color: '#dc3545', fontWeight: 'bold' }}>-₹{item.amount}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Total Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px', paddingTop: '15px', borderTop: '2px solid #102A45' }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                            Total Collections: <span style={{ color: 'green' }}>₹{totalCollections}</span>
                        </div>
                        <div style={{ backgroundColor: '#007bff', color: '#fff', padding: '10px 20px', borderRadius: '4px', fontSize: '18px', fontWeight: 'bold' }}>
                            Balance: ₹{finalBalance}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ClubLedger;