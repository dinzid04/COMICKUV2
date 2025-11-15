import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/firebaseConfig';
import { collection, query, getDocs } from 'firebase/firestore';
import { SEO } from '@/components/seo';
import { Loader2, AlertCircle, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LeaderboardUser {
  uid: string;
  nickname: string;
  photoUrl?: string;
  chaptersRead: number;
}

const LeaderboardPage: React.FC = () => {
  const { data: leaderboard, isLoading, error } = useQuery<LeaderboardUser[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      try {
        const leaderboardRef = collection(db, 'leaderboard');
        const q = query(leaderboardRef);
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map(doc => doc.data() as LeaderboardUser);
        return users.sort((a, b) => (b.chaptersRead || 0) - (a.chaptersRead || 0));
      } catch (err) {
        console.error("Firestore Leaderboard Error:", err);
        throw err;
      }
    },
  });

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
        <h2 className="text-2xl font-bold mb-2">Error</h2>
        <p className="text-muted-foreground">Could not load the leaderboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <SEO title="Leaderboard" description="See the top readers on the platform." />
      <div className="text-center mb-8">
        <Trophy className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
        <h1 className="text-4xl font-bold">Top Readers</h1>
        <p className="text-muted-foreground">The most dedicated readers on our platform.</p>
      </div>

      <div className="space-y-4">
        {leaderboard?.map((user, index) => (
          <div key={user.uid} className="flex items-center bg-muted p-4 rounded-lg">
            <div className="w-12 text-center text-lg font-bold">
              {index + 1}
            </div>
            <Avatar className="h-12 w-12 mx-4">
              <AvatarImage src={user.photoUrl} alt={user.nickname} />
              <AvatarFallback>{user.nickname?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{user.nickname}</p>
            </div>
            <div className="text-lg font-bold">
              {user.chaptersRead}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardPage;
