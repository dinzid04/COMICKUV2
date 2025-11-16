import React, { useState, useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  userId: string;
  displayName: string;
  photoURL: string;
  commentText: string;
  createdAt: any;
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
      await addDoc(collection(db, 'comments'), {
        comicSlug: comicSlug,
        userId: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || '',
        commentText: newComment,
        createdAt: serverTimestamp(),
      });
      setNewComment('');
    } catch (error) {
      toast({ title: "Error", description: "Gagal mengirim komentar.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Komentar</h2>
      {user ? (
        <div className="mb-6">
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="Tulis komentar Anda di sini..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isLoading}
          ></textarea>
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            onClick={handlePostComment}
            disabled={isLoading}
          >
            {isLoading ? 'Mengirim...' : 'Kirim'}
          </button>
        </div>
      ) : (
        <p className="mb-6">Silakan <a href="/auth" className="text-blue-500 underline">login</a> untuk menulis komentar.</p>
      )}

      <div>
        {comments.map(comment => (
          <div key={comment.id} className="border-b py-4">
            <div className="flex items-center mb-2">
              <img
                src={comment.photoURL || "https://avatar.vercel.sh/fallback.png"}
                alt={comment.displayName}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-semibold">{comment.displayName}</p>
                <p className="text-sm text-gray-500">
                  {comment.createdAt?.toDate().toLocaleDateString('id-ID', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <p className="pl-13">{comment.commentText}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
