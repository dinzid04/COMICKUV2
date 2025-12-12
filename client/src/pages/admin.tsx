import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuoteManagement from '@/components/admin/quote-management';
import UserManagement from '@/components/admin/user-management';
import NotificationManagement from '@/components/admin/notification-management';
import ChatManagement from '@/components/admin/chat-management';
import { Users, Quote, Bell, MessageSquare, LayoutDashboard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const AdminPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-900/50">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Main Title & Header (Mobile mostly, or distinct section) */}
          <div className="md:hidden">
            <h1 className="font-display text-3xl font-bold mb-6 flex items-center gap-2">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
          </div>

          <Tabs defaultValue="users" className="flex flex-col md:flex-row w-full gap-8" orientation="vertical">

            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 flex-shrink-0">
               <div className="sticky top-24 space-y-4">
                  <div className="hidden md:flex items-center gap-2 px-2 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <LayoutDashboard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="font-bold text-lg leading-tight">Admin</h1>
                      <p className="text-xs text-muted-foreground">Control Panel</p>
                    </div>
                  </div>

                  <TabsList className="flex flex-row md:flex-col h-auto w-full bg-transparent p-0 gap-2 md:space-y-1 justify-start overflow-x-auto md:overflow-visible">
                    <TabsTrigger
                      value="users"
                      className="w-full justify-start gap-3 px-3 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all border border-transparent hover:bg-muted/50"
                    >
                      <Users className="h-4 w-4" />
                      <span className="hidden md:inline">Users</span>
                      <span className="md:hidden">Users</span>
                    </TabsTrigger>

                    <TabsTrigger
                      value="chat"
                      className="w-full justify-start gap-3 px-3 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all border border-transparent hover:bg-muted/50"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="hidden md:inline">Chat Community</span>
                      <span className="md:hidden">Chat</span>
                    </TabsTrigger>

                    <TabsTrigger
                      value="notifications"
                      className="w-full justify-start gap-3 px-3 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all border border-transparent hover:bg-muted/50"
                    >
                      <Bell className="h-4 w-4" />
                      <span className="hidden md:inline">Notification</span>
                      <span className="md:hidden">Notif</span>
                    </TabsTrigger>

                    <TabsTrigger
                      value="quotes"
                      className="w-full justify-start gap-3 px-3 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all border border-transparent hover:bg-muted/50"
                    >
                      <Quote className="h-4 w-4" />
                      <span className="hidden md:inline">Quotes</span>
                      <span className="md:hidden">Quote</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Quick Stats Summary or Info could go here in the sidebar */}
                  <Card className="hidden md:block mt-8 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                    <CardHeader className="pb-2">
                       <CardTitle className="text-sm font-medium text-muted-foreground">Status System</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                          </span>
                          <span className="text-sm font-bold text-green-600 dark:text-green-400">Operational</span>
                       </div>
                    </CardContent>
                  </Card>
               </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
              <div className="space-y-6">
                <TabsContent value="users" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
                    </div>
                    <UserManagement />
                  </div>
                </TabsContent>

                <TabsContent value="quotes" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                  <div className="flex flex-col gap-6">
                     <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold tracking-tight">Quote Management</h2>
                    </div>
                    <QuoteManagement />
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                  <div className="flex flex-col gap-6">
                     <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold tracking-tight">Notification Settings</h2>
                    </div>
                    <NotificationManagement />
                  </div>
                </TabsContent>

                <TabsContent value="chat" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                  <div className="flex flex-col gap-6">
                     <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold tracking-tight">Chat Moderation</h2>
                    </div>
                    <ChatManagement />
                  </div>
                </TabsContent>
              </div>
            </main>

          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
