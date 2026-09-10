import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import EmployeeDetails from '../pages/EmployeeDetails';
import AddEmployee from '../pages/AddEmployee';
import EditEmployee from '../pages/EditEmployee';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/ProtectedRoute';
import CreateInvoice from '../pages/CreateInvoice';
import ClubLedger from '../components/ClubLedger';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/add"
        element={
          <ProtectedRoute>
            <AddEmployee />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/edit/:id"
        element={
          <ProtectedRoute>
            <EditEmployee />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/:id"
        element={
          <ProtectedRoute>
            <EmployeeDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <CreateInvoice />
          </ProtectedRoute>
        }
      />

      {/* Make sure this route is added before path="*" */}
      <Route
        path="/club-ledger"
        element={
          <ProtectedRoute>
            <ClubLedger />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route must be at the very end */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}