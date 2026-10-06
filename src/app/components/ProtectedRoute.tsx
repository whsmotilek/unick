import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { homeFor } from '../lib/navigation';
import { PageSkeleton } from './skeletons/PageSkeleton';
import { AuthorPending } from '../pages/author/AuthorPending';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  /** Для кабинета автора: пускать только одобренных авторов */
  requireApprovedAuthor?: boolean;
  children?: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, requireApprovedAuthor, children }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageSkeleton />;

  if (!isAuthenticated || !user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={homeFor(user)} replace />;
  }

  if (requireApprovedAuthor && user.role === 'author' && (user.authorStatus === 'pending' || user.authorStatus === 'rejected')) {
    return <AuthorPending />;
  }

  return children ? <>{children}</> : <Outlet />;
}
