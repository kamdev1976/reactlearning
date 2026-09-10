import { createContext, useContext, useState, useEffect } from 'react';

const BillingContext = createContext(null);
//const API_URL = 'http://127.0.0.1:8000';
const API_URL = 'https://pharmacy-backend-poc.onrender.com';

export const BillingProvider = ({ children }) => {
  const [medicines, setMedicines] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch medicines and invoices from local node server on app load
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/medicines`).then((res) => res.json()),
      fetch(`${API_URL}/invoices`).then((res) => res.json())
    ])
      .then(([medsData, invoicesData]) => {
        setMedicines(medsData);
        setInvoices(invoicesData);
      })
      .catch((err) => console.error('Error fetching data from server:', err))
      .finally(() => setLoading(false));
  }, []);

  // Add new medicine to catalog (persisted to db.json)
  const addMedicineToCatalog = (newMed) => {
    const payload = {
      name: newMed.name,
      price: Number(newMed.price),
      stock: Number(newMed.stock)
    };

    fetch(`${API_URL}/medicines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((savedMed) => {
        setMedicines((prev) => [savedMed, ...prev]);
      })
      .catch((err) => console.error('Error adding medicine:', err));
  };

  // Create new invoice (persisted to db.json)
  // src/context/BillingContext.jsx

const createInvoice = async (invoiceData) => {
  try {
    // 1. Save Invoice
    const res = await fetch(`${API_URL}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData)
    });
    const savedInvoice = await res.json();

    // 2. Deduct stock for each purchased item
    for (const item of invoiceData.items) {
      const currentMed = medicines.find((m) => m.id === item.id);
      if (currentMed) {
        const updatedStock = Math.max(0, currentMed.stock - item.qty);

        await fetch(`${API_URL}/medicines/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock: updatedStock })
        });
      }
    }

    // 3. Update local state
    setInvoices((prev) => [savedInvoice, ...prev]);
    setMedicines((prev) =>
      prev.map((med) => {
        const purchased = invoiceData.items.find((item) => item.id === med.id);
        return purchased
          ? { ...med, stock: Math.max(0, med.stock - purchased.qty) }
          : med;
      })
    );
  } catch (err) {
    console.error('Error creating invoice and updating stock:', err);
  }
};

  return (
    <BillingContext.Provider
      value={{
        medicines,
        invoices,
        loading,
        addMedicineToCatalog,
        createInvoice
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => useContext(BillingContext);