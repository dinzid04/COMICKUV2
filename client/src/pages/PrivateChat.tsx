import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/firebaseConfig';
import {
  collection, query, orderBy, onSnapshot, addDoc,
  serverTimestamp, getDocs, where, limit, doc,
  setDoc, getDoc, updateDoc, Timestamp
} from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from "@/hooks/use-toast";
import { Send, Search, ArrowLeft, MessageSquarePlus, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { User as AppUser } from '@shared/types';
import VerificationBadge from '@/components/ui/verification-badge';
// Import the simplified ChatHeader we created previously (or used in RoomChat)
// If it doesn't exist, we fallback or use the main Header, but the user liked "Comic Ku" header.
// I'll assume it exists as I saw it in RoomChat code previously.
import ChatHeader from '@/components/chat-header';

// Interfaces
interface PrivateMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
  read: boolean;
}

interface ChatConversation {
  id: string; // The chat document ID (uid1_uid2)
  otherUser: AppUser; // The other participant's details
  lastMessage: string;
  lastMessageTime: any;
  participants: string[];
}

const PrivateChat: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<AppUser | null>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false); // For mobile view toggling

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChatId]);

  // Load Conversations List
  useEffect(() => {
    if (!user) return;

    // Query chats where I am a participant
    // Note: Firestore array-contains is limited.
    // We will query the top-level collection `private_chats` where `participants` array-contains my UID.
    const q = query(
      collection(db, 'private_chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chats: ChatConversation[] = [];

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const otherUserId = data.participants.find((uid: string) => uid !== user.uid);

        if (otherUserId) {
          // Fetch other user's profile
          // Optimisation: In a real app, cache this or store basic user info in the chat doc.
          // For now, we fetch it to ensure freshness.
          const userDocRef = doc(db, 'users', otherUserId);
          const userDocSnap = await getDoc(userDocRef);

          let otherUserData: AppUser;
          if (userDocSnap.exists()) {
             otherUserData = { uid: otherUserId, ...userDocSnap.data() } as AppUser;
          } else {
             // Fallback
             otherUserData = {
               uid: otherUserId,
               nickname: 'Unknown User',
               username: 'unknown',
               photoUrl: null,
               role: 'user'
             } as AppUser;
          }

          chats.push({
            id: docSnapshot.id,
            otherUser: otherUserData,
            lastMessage: data.lastMessage || '',
            lastMessageTime: data.lastMessageTime,
            participants: data.participants
          });
        }
      }
      setConversations(chats);
    });

    return () => unsubscribe();
  }, [user]);

  // Load Messages for Active Chat
  useEffect(() => {
    if (!activeChatId) return;

    const q = query(
      collection(db, 'private_chats', activeChatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PrivateMessage));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [activeChatId]);

  // Handle User Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      // Searching in 'users' collection as 'user_profiles' might not be populated
      const usersRef = collection(db, 'users');
      // Simple prefix search
      const q = query(
        usersRef,
        where('nickname', '>=', searchQuery),
        where('nickname', '<=', searchQuery + '\uf8ff'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() } as AppUser))
        .filter(u => u.uid !== user?.uid); // Exclude self

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      toast({ title: "Error", description: "Gagal mencari user.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Start Chat with a User
  const startChat = async (targetUser: AppUser) => {
    if (!user) return;

    // Construct Chat ID: sort UIDs to ensure consistency
    const participants = [user.uid, targetUser.uid].sort();
    const chatId = participants.join('_');

    setActiveChatUser(targetUser);
    setActiveChatId(chatId);
    setIsMobileChatOpen(true);
    setIsSearching(false); // Close search view
    setSearchQuery(''); // Clear search
    setSearchResults([]);

    // Check if chat doc exists, if not create it
    const chatRef = doc(db, 'private_chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        participants: participants,
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: serverTimestamp()
      });
    }
  };

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeChatId || !newMessage.trim()) return;

    const text = newMessage.trim();
    setNewMessage(''); // Clear input immediately

    try {
      // 1. Add message to subcollection
      await addDoc(collection(db, 'private_chats', activeChatId, 'messages'), {
        senderId: user.uid,
        text: text,
        createdAt: serverTimestamp(),
        read: false
      });

      // 2. Update top-level chat document with last message
      const chatRef = doc(db, 'private_chats', activeChatId);
      await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageTime: serverTimestamp()
      });

    } catch (error) {
      console.error("Send error:", error);
      toast({ title: "Error", description: "Gagal mengirim pesan.", variant: "destructive" });
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return formatDistanceToNow(date, { addSuffix: true, locale: id });
  };

  // UI Components
  if (!user) {
    return (
      <div className="flex flex-col h-screen items-center justify-center p-4">
        <p>Silakan login untuk menggunakan fitur chat.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-100 dark:bg-gray-900">
      {/* Fixed Top Header (Comic Ku) */}
      <div className="sticky top-0 z-50">
        <ChatHeader />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar / List (Hidden on mobile if chat is open) */}
        <div className={`
          w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col
          ${isMobileChatOpen ? 'hidden md:flex' : 'flex'}
        `}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
            <h2 className="font-bold text-lg">Pesan</h2>
            <button
              onClick={() => setIsSearching(!isSearching)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Cari User"
            >
              {isSearching ? <ArrowLeft className="w-5 h-5" /> : <MessageSquarePlus className="w-5 h-5" />}
            </button>
          </div>

          {/* Content: Search or Chat List */}
          {isSearching ? (
            <div className="flex-1 flex flex-col p-4">
               <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                 <input
                   type="text"
                   placeholder="Cari nickname..."
                   className="flex-1 p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   autoFocus
                 />
                 <button type="submit" className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                   <Search className="w-5 h-5" />
                 </button>
               </form>

               <div className="flex-1 overflow-y-auto">
                 {isLoading ? (
                   <div className="text-center p-4">Loading...</div>
                 ) : searchResults.length > 0 ? (
                   searchResults.map(u => (
                     <div
                       key={u.uid}
                       onClick={() => startChat(u)}
                       className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded-lg mb-2"
                     >
                        <img
                          src={u.photoUrl || "https://avatar.vercel.sh/fallback.png"}
                          alt={u.nickname}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold">{u.nickname}</p>
                          <VerificationBadge verification={u.verification} />
                        </div>
                     </div>
                   ))
                 ) : searchQuery && (
                   <p className="text-center text-gray-500">Tidak ada user ditemukan.</p>
                 )}
               </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Belum ada percakapan.</p>
                  <p className="text-sm mt-2">Klik ikon tambah untuk mulai chat baru.</p>
                </div>
              ) : (
                conversations.map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      setActiveChatUser(chat.otherUser);
                      setIsMobileChatOpen(true);
                    }}
                    className={`
                      flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-800
                      ${activeChatId === chat.id ? 'bg-blue-50 dark:bg-gray-700' : ''}
                    `}
                  >
                    <img
                      src={chat.otherUser.photoUrl || "https://avatar.vercel.sh/fallback.png"}
                      alt={chat.otherUser.nickname}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold truncate">{chat.otherUser.nickname}</h3>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                           {chat.lastMessageTime ? formatDistanceToNow(chat.lastMessageTime.toDate(), { locale: id }) : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Chat Area (Right Side) */}
        <div className={`
          flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-full
          ${!isMobileChatOpen ? 'hidden md:flex' : 'flex'}
        `}>
          {activeChatId && activeChatUser ? (
            <>
              {/* Chat Header (Profile) - Sticky */}
              <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 shrink-0 sticky top-0 z-40">
                <button
                  onClick={() => setIsMobileChatOpen(false)}
                  className="md:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <img
                   src={activeChatUser.photoUrl || "https://avatar.vercel.sh/fallback.png"}
                   alt={activeChatUser.nickname}
                   className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-bold flex items-center gap-1">
                    {activeChatUser.nickname}
                    <VerificationBadge verification={activeChatUser.verification} />
                  </h2>
                </div>
              </div>

              {/* Messages - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex items-start gap-3 ${msg.senderId === user.uid ? 'justify-end' : ''}`}>
                    {msg.senderId !== user.uid && (
                      <img
                        src={activeChatUser.photoUrl || "https://avatar.vercel.sh/fallback.png"}
                        className="w-8 h-8 rounded-full"
                        alt="Sender"
                      />
                    )}
                    <div className={`flex flex-col ${msg.senderId === user.uid ? 'items-end' : 'items-start'}`}>
                      <div className={`
                        max-w-md p-3 rounded-2xl
                        ${msg.senderId === user.uid
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none shadow-sm'
                        }
                      `}>
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-xs text-gray-400 mt-1">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area - Fixed at bottom */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shrink-0 sticky bottom-0 z-40">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ketik pesan..."
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <MessageSquarePlus className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">Pilih percakapan atau mulai chat baru.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivateChat;
