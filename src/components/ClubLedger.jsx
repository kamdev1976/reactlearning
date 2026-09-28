import React, { useState } from 'react';

const ClubLedger = () => {
    // 1. Core State
    const [months, setMonths] = useState(['Sep-26']);
    const [selectedMonth, setSelectedMonth] = useState('Sep-26');
    const [newMonthInput, setNewMonthInput] = useState('');
    
    const [carryForward, setCarryForward] = useState(1433);
    const [collections, setCollections] = useState([
        { id: 1, name: 'Kamdev Sahoo', amount: 1500, receivedBy: 'Sahoo' },
        { id: 2, name: 'Himanshu Gaur', amount: 1500, receivedBy: 'Sahoo' }
    ]);
    const [expenditures, setExpenditures] = useState([
        { id: 1, description: '1 Court charge', amount: 9000 },
        { id: 2, description: '2nd court charge', amount: 8000 }
    ]);

    // 2. Calculated Totals
    const totalCollections = collections.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpenditures = expenditures.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const finalBalance = (Number(carryForward) + totalCollections) - totalExpenditures;

    // 3. Fix Add Month Logic
    const handleAddMonth = () => {
        const monthToAdd = newMonthInput.trim();
        if (!monthToAdd) {
            alert('Please enter a month name (e.g., Oct-26)');
            return;
        }

        if (!months.includes(monthToAdd)) {
            setMonths([...months, monthToAdd]);
            setSelectedMonth(monthToAdd); // Switch to the newly created month
            setNewMonthInput('');
        } else {
            alert('Month already exists!');
        }
    };

    // 4. Transition Month Handler (Carry Forward + Reset Records)
    const handleTransitionMonth = () => {
        const confirmMsg = `Close ${selectedMonth} and transition balance ₹${finalBalance} to the next month?`;
        if (!window.confirm(confirmMsg)) return;

        // Auto-generate or prompt next month label (e.g. "Oct-26")
        const nextMonthLabel = prompt("Enter next month name:", "Oct-26");
        if (!nextMonthLabel) return;

        // Add next month if not in list
        if (!months.includes(nextMonthLabel)) {
            setMonths([...months, nextMonthLabel]);
        }

        // Set state for the new month
        setSelectedMonth(nextMonthLabel);
        setCarryForward(finalBalance); // Carry forward current net balance (+ or -)
        setCollections([]);            // Reset collections
        setExpenditures([]);           // Reset expenditures
    };

    return (
        <div className="ledger-container" style={{ padding: '20px' }}>
            <div className="month-bar" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label>Select Month:</label>
                <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                >
                    {months.map((m) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>

                {/* Input + Button for Add Month Fix */}
                <input 
                    type="text" 
                    placeholder="e.g. Oct-26" 
                    value={newMonthInput}
                    onChange={(e) => setNewMonthInput(e.target.value)}
                />
                <button type="button" onClick={handleAddMonth} className="btn btn-primary">
                    + Add Month
                </button>

                {/* New Transition / Close Month Button */}
                <button 
                    type="button" 
                    onClick={handleTransitionMonth} 
                    className="btn btn-warning"
                    style={{ marginLeft: 'auto', backgroundColor: '#ff9800', color: '#fff' }}
                >
                    Close & Move to Next Month ➔
                </button>
            </div>

            {/* Carry Forward Display */}
            <div style={{ marginTop: '15px' }}>
                <label>Carry Forward: </label>
                <input 
                    type="number" 
                    value={carryForward} 
                    onChange={(e) => setCarryForward(e.target.value)} 
                />
            </div>

            {/* Calculations & Action Displays */}
            <div style={{ marginTop: '20px', fontWeight: 'bold' }}>
                <span>Total Collections: ₹{totalCollections}</span> | 
                <span> Total Expenditures: ₹{totalExpenditures}</span> | 
                <span style={{ color: finalBalance >= 0 ? 'green' : 'red' }}>
                    {" "}Balance: ₹{finalBalance}
                </span>
            </div>
        </div>
    );
};

export default ClubLedger;