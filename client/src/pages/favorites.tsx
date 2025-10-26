import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/firebaseConfig';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { ManhwaCard } from '@/components/manhwa-card';
import { Loader2, AlertCircle } from 'lucide-react';
import { SEO } from '@/components/seo';

interface FavoriteItem {
  id: string;
  title: string;
  image: string;
  addedAt: {
    seconds: number;
    nanoseconds: number;
  };
}

const FavoritesPage: React.FC = () => {
  const { user } = useAuth();

  const fetchFavorites = async () => {
    if (!user) throw new Error("User not logged in");
    const q = query(
      collection(db, "users", user.uid, "favorites"),
      orderBy("addedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as FavoriteItem);
  };

  const { data: favorites, isLoading, error } = useQuery<FavoriteItem[], Error>({
    queryKey: ['favorites', user?.uid],
    queryFn: fetchFavorites,
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Akses Ditolak</h2>
        <p className="text-muted-foreground">Kamu harus login untuk melihat halaman favorit.</p>
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
      <SEO title="Favorit Saya" description="Lihat semua manhwa favorit yang telah kamu simpan." />
      <h1 className="font-display text-3xl font-bold mb-8">Favorit Saya</h1>
      {favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {favorites.map((fav) => (
            <ManhwaCard
              key={fav.id}
              id={fav.id}
              title={fav.title}
              image={fav.image}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Kamu belum punya favorit.</p>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
