import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../context/EmployeeContext';

export default function AddEmployee() {
  const navigate = useNavigate();
  const { addEmployee } = useEmployees();
  const [formData, setFormData] = useState({ name: '', email: '', role: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    addEmployee(formData);
    alert('Employee added successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="container">
      {/* Back to Dashboard Navigation Control */}
      {/* <div style={{ marginBottom: '1.5rem' }}>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ 
            padding: '8px 16px', 
            background: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          &larr; Back to Dashboard
        </button>
      </div> */}

      <div className="login-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h2>Add New Employee</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name *"
              value={formData.name}
              onChange={handleChange}
              style={{ width: '100%', borderColor: errors.name ? 'red' : '#ccc', boxSizing: 'border-box' }}
            />
            {errors.name && <small style={{ color: 'red' }}>{errors.name}</small>}
          </div>

          <div>
            <input
              type="text"
              name="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={handleChange}
              style={{ width: '100%', borderColor: errors.email ? 'red' : '#ccc', boxSizing: 'border-box' }}
            />
            {errors.email && <small style={{ color: 'red' }}>{errors.email}</small>}
          </div>

          <div>
            <input
              type="text"
              name="role"
              placeholder="Role / Position *"
              value={formData.role}
              onChange={handleChange}
              style={{ width: '100%', borderColor: errors.role ? 'red' : '#ccc', boxSizing: 'border-box' }}
            />
            {errors.role && <small style={{ color: 'red' }}>{errors.role}</small>}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{ flex: 1 }}>Add Employee</button>
            <button 
              type="button" 
              onClick={() => navigate('/dashboard')}
              style={{ flex: 1, background: '#ccc', color: '#333' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}