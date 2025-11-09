import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/firebaseConfig';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { ManhwaCard } from '@/components/manhwa-card';
import { Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';
import { SEO } from '@/components/seo';
import { Button } from '@/components/ui/button';

interface HistoryItem {
  manhwaId: string;
  manhwaTitle: string;
  manhwaImage: string;
  lastChapterId: string;
  lastChapterTitle: string;
  readAt: {
    seconds: number;
    nanoseconds: number;
  };
}

const HistoryPage: React.FC = () => {
  const { user } = useAuth();

  const fetchHistory = async () => {
    if (!user) throw new Error("User not logged in");
    const q = query(
      collection(db, "users", user.uid, "history"),
      orderBy("readAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as HistoryItem);
  };

  const { data: history, isLoading, error } = useQuery<HistoryItem[], Error>({
    queryKey: ['history', user?.uid],
    queryFn: fetchHistory,
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Akses Ditolak</h2>
        <p className="text-muted-foreground">Kamu harus login untuk melihat halaman riwayat.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <SEO title="Riwayat Baca" description="Lanjutkan membaca dari chapter terakhir yang kamu buka." />
      <h1 className="font-display text-3xl font-bold mb-8">Riwayat Baca</h1>
      {history && history.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {history.map((item) => (
            <div key={item.manhwaId}>
              <ManhwaCard
                id={item.manhwaId}
                title={item.manhwaTitle}
                image={item.manhwaImage}
                chapter={item.lastChapterTitle}
              />
              <Link to={`/chapter/${item.lastChapterId}`}>
                <Button variant="outline" className="w-full mt-2 text-xs">
                  Lanjutkan Membaca
                </Button>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Riwayat bacamu masih kosong.</p>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
