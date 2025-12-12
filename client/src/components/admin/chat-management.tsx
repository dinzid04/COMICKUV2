import React, { useState } from 'react';
import { db } from '@/firebaseConfig';
import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast';
import { MessageSquare, Trash2, Loader2 } from 'lucide-react';

const ChatManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleDeleteAll = async () => {
    try {
      setLoading(true);
      const chatRef = collection(db, 'chat_messages');
      const snapshot = await getDocs(chatRef);

      if (snapshot.empty) {
        toast({
          title: "Info",
          description: "Tidak ada pesan untuk dihapus.",
        });
        setLoading(false);
        return;
      }

      // Firestore batches support max 500 operations
      const BATCH_SIZE = 500;
      const chunks = [];
      const docs = snapshot.docs;

      for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        chunks.push(docs.slice(i, i + BATCH_SIZE));
      }

      let deletedCount = 0;

      for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        deletedCount += chunk.length;
      }

      toast({
        title: "Success",
        description: `Berhasil menghapus ${deletedCount} pesan.`,
      });

    } catch (error) {
      console.error("Error deleting messages:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus pesan. Pastikan anda adalah admin.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Manajemen Chat Komunitas</CardTitle>
              <CardDescription>
                Kelola pesan yang ada di ruang obrolan komunitas publik.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="flex items-center justify-between rounded-lg border p-4 border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/50">
            <div className="space-y-0.5">
              <h3 className="text-base font-semibold text-red-900 dark:text-red-200">Hapus Semua Pesan</h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                Tindakan ini akan menghapus permanen semua riwayat percakapan di Komunitas.
                User tidak akan bisa melihat pesan lama lagi.
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Hapus Semua
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Semua pesan dalam chat komunitas akan dihapus secara permanen dari database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAll} className="bg-red-600 hover:bg-red-700">
                    Ya, Hapus Semua
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default ChatManagement;
