import React, { useState } from 'react';

const ClubLedger = () => {
    const [months, setMonths] = useState(['Sep-26']);
    const [selectedMonth, setSelectedMonth] = useState('Sep-26');
    const [newMonthInput, setNewMonthInput] = useState('');
    const [carryForward, setCarryForward] = useState(1433);

    // Form states
    const [memberInput, setMemberInput] = useState({ name: '', amount: '', receivedBy: '' });
    const [expenseInput, setExpenseInput] = useState({ description: '', amount: '' });

    // Collections & Expenditures data state
    const [collections, setCollections] = useState([
        { id: 1, name: 'Kamdev Sahoo', amount: 1500, receivedBy: 'Sahoo' },
        { id: 2, name: 'Himanshu Gaur', amount: 1500, receivedBy: 'Sahoo' },
        { id: 3, name: 'Mahesh', amount: 1000, receivedBy: 'Sahoo' },
        { id: 4, name: 'Ankit Gupta', amount: 1500, receivedBy: 'Sahoo' },
        { id: 5, name: 'Kundan', amount: 1500, receivedBy: 'Sahoo' },
        { id: 6, name: 'Abhishek Sen', amount: 1500, receivedBy: 'Sahoo' },
        { id: 7, name: 'Mohanty', amount: 1500, receivedBy: 'Sahoo' },
        { id: 8, name: 'Ambuj', amount: 1500, receivedBy: 'Sahoo' },
        { id: 9, name: 'Anup', amount: 1500, receivedBy: 'Sahoo' },
        { id: 10, name: 'Amod Giri', amount: 1500, receivedBy: 'Sahoo' },
        { id: 11, name: 'Vivek', amount: 1500, receivedBy: 'Sahoo' },
        { id: 12, name: 'Madan', amount: 1500, receivedBy: '-' }
    ]);

    const [expenditures, setExpenditures] = useState([
        { id: 1, description: '1 Court charge', amount: 9000 },
        { id: 2, description: '2nd court charge', amount: 8000 }
    ]);

    // Totals calculation
    const totalCollections = collections.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpenditures = expenditures.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const finalBalance = (Number(carryForward || 0) + totalCollections) - totalExpenditures;

    // Handlers
    const handleAddMonth = () => {
        const monthToAdd = newMonthInput.trim();
        if (!monthToAdd) return alert('Enter a month name (e.g. Oct-26)');
        if (!months.includes(monthToAdd)) {
            setMonths([...months, monthToAdd]);
            setSelectedMonth(monthToAdd);
            setNewMonthInput('');
        } else {
            alert('Month already exists!');
        }
    };

    const handleAddCollection = (e) => {
        e.preventDefault();
        if (!memberInput.name || !memberInput.amount) return;
        setCollections([
            ...collections,
            {
                id: Date.now(),
                name: memberInput.name,
                amount: Number(memberInput.amount),
                receivedBy: memberInput.receivedBy || '-'
            }
        ]);
        setMemberInput({ name: '', amount: '', receivedBy: '' });
    };

    const handleAddExpense = (e) => {
        e.preventDefault();
        if (!expenseInput.description || !expenseInput.amount) return;
        setExpenditures([
            ...expenditures,
            {
                id: Date.now(),
                description: expenseInput.description,
                amount: Number(expenseInput.amount)
            }
        ]);
        setExpenseInput({ description: '', amount: '' });
    };

    const handleTransitionMonth = () => {
        const confirmMsg = `Close ${selectedMonth} and transition balance ₹${finalBalance} to the next month?`;
        if (!window.confirm(confirmMsg)) return;

        const nextMonthLabel = prompt("Enter next month name:", "Oct-26");
        if (!nextMonthLabel) return;

        if (!months.includes(nextMonthLabel)) {
            setMonths([...months, nextMonthLabel]);
        }

        setSelectedMonth(nextMonthLabel);
        setCarryForward(finalBalance);
        setCollections([]);
        setExpenditures([]);
    };

    return (
        <div style={{ maxWidth: '1050px', margin: '30px auto', fontFamily: 'sans-serif' }}>
            <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
                
                {/* Dark Header */}
                <div style={{ backgroundColor: '#102A45', color: '#fff', textAlign: 'center', padding: '12px', fontSize: '18px', fontWeight: 'bold' }}>
                    {selectedMonth} — Shuttlers Club Collection & Expenditure Summary
                </div>

                <div style={{ padding: '20px' }}>
                    {/* Control Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontWeight: 'bold' }}>Select Month:</label>
                            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: '4px 8px' }}>
                                {months.map(m => <option key={m} value={m}>{m}</option>)}
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
                                    onChange={(e) => setCarryForward(e.target.value)}
                                    style={{ width: '80px', padding: '4px', textAlign: 'right' }}
                                />
                            </div>

                            {/* Transition Button */}
                            <button 
                                onClick={handleTransitionMonth}
                                style={{ backgroundColor: '#ff9800', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '3px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Close & Move to Next Month ➔
                            </button>
                        </div>
                    </div>

                    {/* Entry Forms */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                        {/* Collection Form */}
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

                        {/* Expenditure Form */}
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

                    {/* Side-by-side Tables */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        {/* Collections Table */}
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
                                    {collections.map((item, index) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '6px' }}>{index + 1}</td>
                                            <td style={{ padding: '6px' }}>{item.name}</td>
                                            <td style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>₹{item.amount}</td>
                                            <td style={{ padding: '6px' }}>{item.receivedBy}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Expenditures Table */}
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
                                    {expenditures.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '6px' }}>{item.description}</td>
                                            <td style={{ padding: '6px', textAlign: 'right', color: '#dc3545', fontWeight: 'bold' }}>-₹{item.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary Footer Bar */}
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