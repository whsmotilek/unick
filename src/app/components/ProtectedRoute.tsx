import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectMap: Record<string, string> = {
      author: '/author',
      student: '/student',
      curator: '/curator',
      admin: '/admin',
    };
    return <Navigate to={redirectMap[user.role] || '/'} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
