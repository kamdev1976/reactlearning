export const fetchEmployees = async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/users');
  if (!response.ok) throw new Error('Failed to fetch employees');
  const data = await response.json();
  return data.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.company.bs,
  }));
};

export const fetchEmployeeById = async (id) => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  if (!response.ok) throw new Error('Failed to fetch employee details');
  const user = await response.json();
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    website: user.website,
    company: user.company.name,
    city: user.address.city,
    role: user.company.bs,
  };
};
// Add this at the bottom of src/api/employeeApi.js

export const createEmployee = async (employeeData) => {
  const response = await fetch('https://jsonplaceholder.typicode.com/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employeeData),
  });
  
  if (!response.ok) throw new Error('Failed to create employee');
  return await response.json();
};