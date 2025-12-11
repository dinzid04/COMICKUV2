import React, { useState, useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from '@shared/types';
import { toast } from '@/hooks/use-toast';
import { Check, Shield, Users, Activity, EyeOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<(User & { isOnline: boolean })[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0
  });

  const getUsers = async () => {
    setLoading(true);
    const usersCollectionRef = collection(db, "users");
    const data = await getDocs(usersCollectionRef);
    const userList = data.docs.map((doc) => {
      const userData = doc.data() as any;

      // Calculate online status
      let isOnline = false;
      if (userData.lastSeen) {
        const lastSeenTime = userData.lastSeen.toMillis ? userData.lastSeen.toMillis() : new Date(userData.lastSeen).getTime();
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        isOnline = lastSeenTime > fiveMinutesAgo;
      }

      return { ...userData, uid: doc.id, isOnline } as User & { isOnline: boolean };
    });

    // Calculate stats
    const total = userList.length;
    const online = userList.filter(u => u.isOnline).length;
    const offline = total - online;

    // Sort: Online first, then by nickname
    userList.sort((a, b) => {
        if (a.isOnline === b.isOnline) {
            return (a.nickname || '').localeCompare(b.nickname || '');
        }
        return a.isOnline ? -1 : 1;
    });

    setUsers(userList);
    setStats({ total, online, offline });
    setLoading(false);
  };

  useEffect(() => {
    getUsers();
    // Refresh stats every 30 seconds to keep "Online" status relatively fresh in UI
    const interval = setInterval(getUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleVerification = async (uid: string, verification: 'verified' | 'admin' | null) => {
    try {
      const userDoc = doc(db, "users", uid);
      await updateDoc(userDoc, { verification });
      toast({
        title: "Success",
        description: `User verification status updated.`,
      });
      getUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating verification status:", error);
      toast({
        title: "Error",
        description: "Failed to update verification status.",
        variant: "destructive",
      });
    }
  };

  const chartData = [
    { name: 'Online', value: stats.online },
    { name: 'Offline', value: stats.offline },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Users</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.online}</div>
            <p className="text-xs text-muted-foreground">Active in last 5 mins</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline Users</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.offline}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
          <CardHeader>
              <CardTitle>User Activity Overview</CardTitle>
              <CardDescription>Real-time online status distribution</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
             <div className="h-[200px] w-full"> {/* Height adjusted as requested */}
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name === 'Online' ? '#22c55e' : '#94a3b8'} />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && users.length === 0 ? (
            <p>Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Nickname</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <div className="relative inline-block">
                        <Avatar>
                          <AvatarImage src={user.photoUrl} alt={user.nickname} />
                          <AvatarFallback>{user.nickname?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {user.isOnline && (
                           <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-950"></span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span>{user.nickname}</span>
                            <span className="text-xs text-muted-foreground">{user.isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                        {user.isOnline ? (
                             <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Online</span>
                        ) : (
                             <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Offline</span>
                        )}
                    </TableCell>
                    <TableCell>
                      {user.verification === 'admin' && <Shield className="h-5 w-5 text-red-500" />}
                      {user.verification === 'verified' && <Check className="h-5 w-5 text-blue-500" />}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleVerification(user.uid, 'verified')}>
                          Verify
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleVerification(user.uid, 'admin')}>
                          Make Admin
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleVerification(user.uid, null)}>
                          Remove Access
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
