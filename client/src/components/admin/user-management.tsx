import React, { useState, useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from '@shared/types';
import { toast } from '@/hooks/use-toast';
import { Check, Shield } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const getUsers = async () => {
    setLoading(true);
    const usersCollectionRef = collection(db, "users");
    const data = await getDocs(usersCollectionRef);
    const userList = data.docs.map((doc) => ({ ...doc.data(), uid: doc.id } as User));
    setUsers(userList);
    setLoading(false);
  };

  useEffect(() => {
    getUsers();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Nickname</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={user.photoUrl} alt={user.nickname} />
                      <AvatarFallback>{user.nickname.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{user.nickname}</TableCell>
                  <TableCell>{user.email}</TableCell>
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
  );
};

export default UserManagement;
