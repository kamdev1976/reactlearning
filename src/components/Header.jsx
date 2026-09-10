import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="header">
      <h2 style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
        POC Dashboard
      </h2>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/billing')} 
            style={{ background: '#28a745', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
          >
            + New Medicine Bill
          </button>

          {/* Added Club Ledger Button */}
          <button 
            onClick={() => navigate('/club-ledger')} 
            style={{ background: '#0284c7', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Club Ledger
          </button>

          <span>Welcome, {user.username} ({user.role})</span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      )}
    </header>
  );
}