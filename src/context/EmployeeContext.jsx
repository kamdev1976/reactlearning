import { createContext, useContext, useState, useEffect } from 'react';
import { fetchEmployees as apiFetchEmployees } from '../api/employeeApi';

const EmployeeContext = createContext(null);

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('poc_employees');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(!localStorage.getItem('poc_employees'));

  useEffect(() => {
    if (!localStorage.getItem('poc_employees')) {
      apiFetchEmployees()
        .then((data) => {
          setEmployees(data);
          localStorage.setItem('poc_employees', JSON.stringify(data));
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const addEmployee = (newEmp) => {
    const updated = [{ ...newEmp, id: Date.now() }, ...employees];
    setEmployees(updated);
    localStorage.setItem('poc_employees', JSON.stringify(updated));
  };

  // Update existing employee data by ID
  const updateEmployee = (id, updatedData) => {
    const updated = employees.map((emp) =>
      String(emp.id) === String(id) ? { ...emp, ...updatedData } : emp
    );
    setEmployees(updated);
    localStorage.setItem('poc_employees', JSON.stringify(updated));
  };

  const deleteEmployee = (id) => {
    const updated = employees.filter((emp) => String(emp.id) !== String(id));
    setEmployees(updated);
    localStorage.setItem('poc_employees', JSON.stringify(updated));
  };

  return (
    <EmployeeContext.Provider value={{ employees, loading, addEmployee, updateEmployee, deleteEmployee }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = () => useContext(EmployeeContext);