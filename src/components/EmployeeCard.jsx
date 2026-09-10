import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../context/EmployeeContext';
import { useAuth } from '../context/AuthContext'; // 1. Import useAuth
import ConfirmModal from './ConfirmModal';

export default function EmployeeCard({ employee }) {
  const navigate = useNavigate();
  const { deleteEmployee } = useEmployees();
  const { user } = useAuth(); // 2. Extract user object to read user.role
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/employee/edit/${employee.id}`);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteEmployee(employee.id);
    setIsModalOpen(false);
  };

  return (
    <>
      <div 
        className="employee-card" 
        onClick={() => navigate(`/employee/${employee.id}`)}
        style={{ cursor: 'pointer', position: 'relative' }}
      >
        <h3>{employee.name}</h3>
        <p><strong>Email:</strong> {employee.email}</p>
        <p><strong>Role:</strong> {employee.role}</p>

        {/* 3. Conditionally render Edit & Delete bar ONLY for Admin users */}
        {user?.role === 'Admin' && (
          <div style={{ marginTop: '1.2rem', display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={handleEdit} 
              style={{ flex: 1, padding: '7px 12px', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Edit
            </button>
            <button 
              onClick={handleDeleteClick} 
              style={{ flex: 1, padding: '7px 12px', background: 'transparent', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer' }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={isModalOpen}
        title="Delete Employee"
        message={`Are you sure you want to delete ${employee.name}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}