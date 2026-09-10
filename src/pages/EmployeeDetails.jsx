import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEmployeeById } from '../api/employeeApi';
import Loader from '../components/Loader';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeById(id)
      .then((data) => setEmployee(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;

  if (!employee) return <div className="container">Employee not found.</div>;

  return (
    <div className="container">
      <button 
        onClick={() => navigate('/dashboard')} 
        style={{ marginBottom: '1rem', padding: '8px 16px', cursor: 'pointer' }}
      >
        &larr; Back to Dashboard
      </button>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>{employee.name}</h2>
        <p><strong>Username:</strong> {employee.username}</p>
        <p><strong>Email:</strong> {employee.email}</p>
        <p><strong>Phone:</strong> {employee.phone}</p>
        <p><strong>Website:</strong> {employee.website}</p>
        <p><strong>Company:</strong> {employee.company}</p>
        <p><strong>City:</strong> {employee.city}</p>
        <p><strong>Role Details:</strong> {employee.role}</p>
      </div>
    </div>
  );
}