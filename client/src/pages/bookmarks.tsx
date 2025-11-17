import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Link } from 'wouter';
import { SEO } from '@/components/seo';
import { Loader2 } from 'lucide-react';

interface Bookmark {
  id: string;
  manhwaTitle: string;
  manhwaImage: string;
  chapterTitle: string;
  chapterId: string;
  bookmarkedAt: any;
}

const BookmarksPage: React.FC = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'bookmarks'),
      orderBy('bookmarkedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const bookmarksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Bookmark));
      setBookmarks(bookmarksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <div className="container mx-auto max-w-7xl px-4 py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    return <div className="container mx-auto max-w-7xl px-4 py-8">Please log in to see your bookmarks.</div>;
  }

  return (
    <>
      <SEO title="My Bookmarks" description="Access your bookmarked chapters." />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <h1 className="font-display text-4xl font-bold mb-8">My Bookmarks</h1>
        {bookmarks.length === 0 ? (
          <p>You haven't bookmarked any chapters yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map(bookmark => (
              <Link key={bookmark.id} href={`/chapter/${bookmark.chapterId}`}>
                <a className="group block bg-card border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <img src={bookmark.manhwaImage} alt={bookmark.manhwaTitle} className="w-full h-48 object-cover rounded-md mb-4" />
                  <h3 className="font-semibold text-lg truncate group-hover:text-primary">{bookmark.manhwaTitle}</h3>
                  <p className="text-muted-foreground">{bookmark.chapterTitle}</p>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default BookmarksPage;
