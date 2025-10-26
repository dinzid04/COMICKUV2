import React from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Spinner } from './ui/spinner';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin, needsSetup } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  if (user && (isAdmin || needsSetup)) {
    return <>{children}</>;
  }

  return <Redirect to="/" />;
};

export default AdminRoute;
