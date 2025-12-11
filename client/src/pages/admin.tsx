import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuoteManagement from '@/components/admin/quote-management';
import UserManagement from '@/components/admin/user-management';
import NotificationManagement from '@/components/admin/notification-management';

const AdminPage: React.FC = () => {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-4xl font-bold mb-8">Admin Dashboard</h1>
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="quotes">Quote Management</TabsTrigger>
          <TabsTrigger value="notifications">Notification</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        <TabsContent value="quotes">
          <QuoteManagement />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
