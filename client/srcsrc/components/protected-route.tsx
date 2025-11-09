import React from 'react';
import { Redirect } from 'wouter';
import { useAdmin } from '@/hooks/use-admin';

interface ProtectedRouteProps {
  component: React.ComponentType;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component }) => {
  const { isAdmin } = useAdmin();
  return isAdmin ? <Component /> : <Redirect to="/" />;
};
