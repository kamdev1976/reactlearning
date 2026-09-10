import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
      <h1>404 - Page Not Found</h1>
      <Link to="/dashboard">Go Back to Dashboard</Link>
    </div>
  );
}