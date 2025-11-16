import React, { useState, useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

import VerificationBadge from '@/components/ui/verification-badge';

interface Comment {
  id: string;
  userId: string;
  displayName: string;
  photoURL: string;
  commentText: string;
  createdAt: any;
  verification?: 'admin' | 'verified' | null;
}

interface CommentSectionProps {
  comicSlug: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comicSlug }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!comicSlug) return;

    const q = query(
      collection(db, 'comments'),
      where('comicSlug', '==', comicSlug),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Comment));
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [comicSlug]);

  const handlePostComment = async () => {
    if (!user) {
      toast({ title: "Error", description: "Anda harus login untuk berkomentar.", variant: "destructive" });
      return;
    }
    if (newComment.trim() === '') {
      toast({ title: "Error", description: "Komentar tidak boleh kosong.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      // Fetch user profile from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();

      const displayName = userData?.nickname || user.displayName || 'Anonymous';
      const photoURL = userData?.photoUrl || user.photoURL || '';
      const verification = userData?.verification || null;

      await addDoc(collection(db, 'comments'), {
        comicSlug: comicSlug,
        userId: user.uid,
        displayName: displayName,
        photoURL: photoURL,
        commentText: newComment,
        createdAt: serverTimestamp(),
        verification: verification,
      });
      setNewComment('');
    } catch (error) {
      toast({ title: "Error", description: "Gagal mengirim komentar.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const formatRelativeTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: id });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Diskusi</h2>
      {user ? (
        <div className="flex items-start space-x-4 mb-8">
          <img
            src={user.photoURL || "https://avatar.vercel.sh/fallback.png"}
            alt="Your avatar"
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <textarea
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition"
              rows={3}
              placeholder={`Bergabung dalam diskusi sebagai ${user.displayName}...`}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isLoading}
            ></textarea>
            <button
              className="mt-3 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
              onClick={handlePostComment}
              disabled={isLoading}
            >
              {isLoading ? 'Mengirim...' : 'Kirim Komentar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Anda Ingin Bergabung?</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Masuk untuk membagikan pemikiran Anda dan berdiskusi dengan komunitas.</p>
            <a href="/auth" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Masuk atau Daftar
            </a>
        </div>
      )}

      <div className="space-y-6">
        {comments.map(comment => (
          <div key={comment.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <img
              src={comment.photoURL || "https://avatar.vercel.sh/fallback.png"}
              alt={comment.displayName}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <p className="font-bold text-lg text-gray-900 dark:text-white">{comment.displayName}</p>
                <VerificationBadge verification={comment.verification} />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {comment.createdAt ? formatRelativeTime(comment.createdAt.toDate()) : ''}
                </p>
              </div>
              <p className="mt-1 text-gray-700 dark:text-gray-300">{comment.commentText}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
