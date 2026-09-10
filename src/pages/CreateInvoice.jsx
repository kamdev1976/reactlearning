import React, { useState } from 'react';
import { useBilling } from '../context/BillingContext';

const CreateInvoice = () => {
  const { medicines, invoices, createInvoice } = useBilling();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add item to cart with stock validation
  const addToCart = (medicine) => {
    const existing = cart.find((item) => item.id === medicine.id);
    const currentQty = existing ? existing.qty : 0;

    if (currentQty >= medicine.stock) {
      alert(`Cannot add more. Only ${medicine.stock} units available in stock!`);
      return;
    }

    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === medicine.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...medicine, qty: 1 }]);
    }
  };

  // Update item quantity with stock cap
  const updateQty = (id, newQty) => {
    const medicine = medicines.find((m) => m.id === id);
    
    if (newQty > medicine.stock) {
      alert(`Cannot exceed available stock of ${medicine.stock} units!`);
      return;
    }

    if (newQty <= 0) {
      setCart(cart.filter((item) => item.id !== id));
    } else {
      setCart(
        cart.map((item) => (item.id === id ? { ...item, qty: newQty } : item))
      );
    }
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const gst = Math.round(subtotal * 0.12); // 12% GST
  const grandTotal = subtotal + gst;

  // Form Submit Handler
  const handleSubmitInvoice = async (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert('Please enter patient / customer name.');
      return;
    }

    if (cart.length === 0) {
      alert('Please add at least one medicine to the invoice.');
      return;
    }

    setIsSubmitting(true);

    const invoicePayload = {
      customer: customerName,
      phone: phone || 'N/A',
      paymentMode,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
      })),
      subtotal,
      gst,
      total: grandTotal,
    };

    await createInvoice(invoicePayload);

    // Reset Form
    setCustomerName('');
    setPhone('');
    setPaymentMode('Cash');
    setCart([]);
    setIsSubmitting(false);

    alert('Invoice generated and stock updated successfully!');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '24px', color: '#1e293b' }}>Pharmacy Billing & Invoicing</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Left Column: Available Medicines */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#334155' }}>Available Medicines</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {medicines.map((med) => (
              <div
                key={med.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  border: '1px solid #f1f5f9',
                  borderRadius: '6px',
                  backgroundColor: med.stock <= 0 ? '#f8fafc' : '#fff'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>{med.name}</div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    Price: ₹{med.price} | Stock:{' '}
                    <span style={{ fontWeight: 'bold', color: med.stock <= 0 ? '#ef4444' : '#10b981' }}>
                      {med.stock}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => addToCart(med)}
                  disabled={med.stock <= 0}
                  style={{
                    backgroundColor: med.stock <= 0 ? '#94a3b8' : '#2563eb',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontWeight: '600',
                    cursor: med.stock <= 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {med.stock <= 0 ? 'Out of Stock' : '+ Add'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Invoice Summary & Form */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#334155' }}>Invoice Summary</h3>
          <form onSubmit={handleSubmitInvoice}>
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Patient / Customer Name *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                required
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              >
                <option value="Cash">Payment Mode: Cash</option>
                <option value="UPI">Payment Mode: UPI</option>
                <option value="Card">Payment Mode: Card</option>
              </select>
            </div>

            {/* Cart Table */}
            {cart.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: '14px', color: '#64748b' }}>
                    <th style={{ padding: '8px 0' }}>Item</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 0', fontSize: '14px' }}>{item.name}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          style={{ padding: '2px 8px', cursor: 'pointer' }}
                        >
                          -
                        </button>
                        <span style={{ margin: '0 8px', fontSize: '14px' }}>{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          style={{ padding: '2px 8px', cursor: 'pointer' }}
                        >
                          +
                        </button>
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '14px' }}>₹{item.price * item.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>
                No items added to current invoice.
              </div>
            )}

            {/* Totals */}
            <div style={{ borderTop: '2px solid #1e293b', paddingTop: '12px', marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#475569' }}>
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#475569' }}>
                <span>GST (12%):</span>
                <span>₹{gst}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', color: '#0f172a' }}>
                <span>Grand Total:</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              style={{
                width: '100%',
                backgroundColor: cart.length === 0 ? '#94a3b8' : '#16a34a',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '16px',
                marginTop: '20px',
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Processing...' : 'Collect Payment & Generate Invoice'}
            </button>
          </form>
        </div>
      </div>

      {/* Generated Invoices History */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#334155' }}>Generated Invoices History</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left', fontSize: '14px', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>Invoice ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Items Purchased</th>
              <th>Payment</th>
              <th>Total Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? (
              invoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#2563eb' }}>{inv.id}</td>
                  <td>{inv.customer}</td>
                  <td>{inv.phone}</td>
                  <td>
                    {inv.items?.map((item) => `${item.name} (x${item.qty})`).join(', ') || '-'}
                  </td>
                  <td>{inv.paymentMode}</td>
                  <td style={{ fontWeight: 'bold' }}>₹{inv.total}</td>
                  <td style={{ color: '#64748b' }}>{inv.createdAt || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                  No invoices generated yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreateInvoice;