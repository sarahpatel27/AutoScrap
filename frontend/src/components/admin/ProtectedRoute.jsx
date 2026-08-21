import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0b241b] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#dff46b] border-t-transparent"></div>
          <p className="font-extrabold text-[#c8ded4]">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated user to /admin/login while saving current location
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
