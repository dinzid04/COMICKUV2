import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/firebaseConfig';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, where, limit, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from "@/hooks/use-toast";
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { User } from '@shared/types';
import DOMPurify from 'dompurify';
import VerificationBadge from '@/components/ui/verification-badge';
import ChatHeader from '@/components/chat-header';

interface ChatMessage {
  id: string;
  userId: string;
  displayName: string;
  photoURL: string;
  text: string;
  createdAt: any;
  mentions?: string[];
  verification?: 'admin' | 'verified' | null;
}

const RoomChat: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mentionUsers, setMentionUsers] = useState<User[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentions, setMentions] = useState<string[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const q = query(collection(db, 'chat_messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(messagesData);
    });
    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || newMessage.trim() === '') return;

    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();

      const displayName = userData?.nickname || user.displayName || 'Anonymous';
      const photoURL = userData?.photoUrl || user.photoURL || '';
      const verification = userData?.verification || null;

      await addDoc(collection(db, 'chat_messages'), {
        userId: user.uid,
        displayName: displayName,
        photoURL: photoURL,
        text: newMessage,
        createdAt: serverTimestamp(),
        mentions: mentions,
        verification: verification,
      });
      setNewMessage('');
      setMentions([]);
    } catch (error) {
      toast({ title: "Error", description: "Gagal mengirim pesan.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = async (searchQuery: string) => {
    if (searchQuery.length === 0) {
      setMentionUsers([]);
      return;
    }
    const usersRef = collection(db, 'user_profiles');
    const q = query(
      usersRef,
      where('nickname', '>=', searchQuery),
      where('nickname', '<=', searchQuery + '\uf8ff'),
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    const usersList = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
    setMentionUsers(usersList.filter(u => u.uid !== user?.uid));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setNewMessage(text);

    const mentionMatch = text.match(/@(\w*)$/);
    if (mentionMatch) {
      setShowMentions(true);
      searchUsers(mentionMatch[1]);
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (selectedUser: User) => {
    const currentMessage = newMessage.substring(0, newMessage.lastIndexOf('@'));
    setNewMessage(`${currentMessage}@${selectedUser.nickname} `);
    setMentions([...mentions, selectedUser.uid]);
    setShowMentions(false);
  };

  const formatRelativeTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: id });
  };

  const highlightMentions = (text: string) => {
    const rawHTML = text.replace(/@(\w+)/g, `<strong class="text-blue-400">@$1</strong>`);
    return DOMPurify.sanitize(rawHTML);
  };

  return (
    <div data-testid="room-chat-container" className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.userId === user?.uid ? 'justify-end' : ''}`}>
             {msg.userId !== user?.uid && <img src={msg.photoURL || "https://avatar.vercel.sh/fallback.png"} alt={msg.displayName} className="w-10 h-10 rounded-full" />}
            <div className={`flex flex-col ${msg.userId === user?.uid ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-md p-3 rounded-2xl ${msg.userId === user?.uid ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm">{msg.displayName}</p>
                  <VerificationBadge verification={msg.verification} />
                </div>
                <p dangerouslySetInnerHTML={{ __html: highlightMentions(msg.text) }}></p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{msg.createdAt ? formatRelativeTime(msg.createdAt.toDate()) : ''}</p>
            </div>
             {msg.userId === user?.uid && <img src={msg.photoURL || "https://avatar.vercel.sh/fallback.png"} alt={msg.displayName} className="w-10 h-10 rounded-full" />}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 relative mt-auto">
        {showMentions && mentionUsers.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-t-lg shadow-lg max-h-60 overflow-y-auto">
            {mentionUsers.map(u => (
              <div key={u.uid} onClick={() => handleMentionSelect(u)} className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                <img src={u.photoUrl || "https://avatar.vercel.sh/fallback.png"} alt={u.nickname} className="w-8 h-8 rounded-full mr-3" />
                <span className="font-semibold text-gray-900 dark:text-white">{u.nickname}</span>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder={user ? "Ketik pesan Anda atau gunakan @ untuk mention..." : "Silakan login untuk bergabung dalam obrolan"}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!user || isLoading}
          />
          <button type="submit" className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400" disabled={!user || isLoading || newMessage.trim() === ''}>
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoomChat;
