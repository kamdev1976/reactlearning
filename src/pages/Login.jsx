import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Admin');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      login(username, role);
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '10px' }}>
          <option value="Admin">Admin (Full Access)</option>
          <option value="Viewer">Viewer (Read Only)</option>
        </select>

        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}