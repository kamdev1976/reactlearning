import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../context/EmployeeContext';
import { useAuth } from '../context/AuthContext'; // 1. Import useAuth
import EmployeeCard from '../components/EmployeeCard';
import Loader from '../components/Loader';

export default function Dashboard() {
  const { employees, loading } = useEmployees();
  const { user } = useAuth(); // 2. Extract user object from AuthContext
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Client-side search filtering using useMemo for performance
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const term = searchTerm.toLowerCase();
      const nameMatch = emp.name ? emp.name.toLowerCase().includes(term) : false;
      const emailMatch = emp.email ? emp.email.toLowerCase().includes(term) : false;
      const roleMatch = emp.role ? emp.role.toLowerCase().includes(term) : false;
      return nameMatch || emailMatch || roleMatch;
    });
  }, [employees, searchTerm]);

  return (
    <div className="container">
      {/* Header section with Title and Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Employee List</h1>
        
        {/* 3. Render the Add Employee button ONLY if role is Admin */}
        {user?.role === 'Admin' && (
          <button 
            onClick={() => navigate('/employee/add')}
            style={{ 
              padding: '10px 18px', 
              background: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            + Add Employee
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '10px', 
            borderRadius: '4px', 
            border: '1px solid #ccc',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Grid Display */}
      {loading ? (
        <Loader />
      ) : filteredEmployees.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>No employees found matching your search.</div>
      ) : (
        <div className="employee-grid">
          {filteredEmployees.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))}
        </div>
      )}
    </div>
  );
}