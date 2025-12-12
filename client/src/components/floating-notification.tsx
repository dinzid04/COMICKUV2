import React, { useState, useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { doc, onSnapshot, collection, query, where, getCountFromServer, Timestamp } from 'firebase/firestore';
import { X, Activity, Users, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationConfig {
  enabled: boolean;
  showStats: boolean;
  message: string;
  imageUrl: string;
  cooldownMinutes?: number;
  updatedAt?: any; // Firestore Timestamp
}

interface UserStats {
  total: number;
  online: number;
  offline: number;
}

export function FloatingNotification() {
  const [config, setConfig] = useState<NotificationConfig | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasFetchedStats, setHasFetchedStats] = useState(false);

  useEffect(() => {
    // Listen for configuration changes
    const unsub = onSnapshot(doc(db, 'settings', 'site_config'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as NotificationConfig;
        setConfig(data);

        if (data.enabled) {
            checkShouldShow(data);
        } else {
            setIsOpen(false);
        }
      } else {
        setConfig(null);
        setIsOpen(false);
      }
    });

    return () => unsub();
  }, []);

  const checkShouldShow = (data: NotificationConfig) => {
      // 1. Check if it's a new update
      const storedLastConfigTime = localStorage.getItem('notification_last_config_time');
      const currentConfigTime = data.updatedAt ? (data.updatedAt.toMillis ? data.updatedAt.toMillis() : 0) : 0;

      if (!storedLastConfigTime || currentConfigTime > parseInt(storedLastConfigTime)) {
          // New update! Show it regardless of cooldown, unless already closed in this session (optional, but let's prioritize update)
          // Actually, if it's a new update, we should probably show it even if closed in session?
          // Let's stick to standard flow: Show it.
          setIsOpen(true);
          return;
      }

      // 2. Check Cooldown
      if (data.cooldownMinutes && data.cooldownMinutes > 0) {
          const storedLastSeen = localStorage.getItem('notification_last_seen');
          if (!storedLastSeen) {
              setIsOpen(true);
          } else {
              const lastSeenTime = parseInt(storedLastSeen);
              const now = Date.now();
              const cooldownMillis = data.cooldownMinutes * 60 * 1000;

              if (now - lastSeenTime > cooldownMillis) {
                  setIsOpen(true);
              } else {
                  setIsOpen(false);
              }
          }
      } else {
          // 3. Session based (default)
          const isClosed = sessionStorage.getItem('notification_closed');
          if (!isClosed) {
              setIsOpen(true);
          } else {
              setIsOpen(false);
          }
      }
  };

  useEffect(() => {
    if (config?.enabled && config?.showStats && !hasFetchedStats) {
      fetchStats();
    }
  }, [config]);

  const fetchStats = async () => {
    try {
      // 1. Total Users
      const usersColl = collection(db, 'users');
      const totalSnapshot = await getCountFromServer(usersColl);
      const total = totalSnapshot.data().count;

      // 2. Online Users (Active in last 5 minutes)
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

      const onlineQuery = query(
        usersColl,
        where("lastSeen", ">", Timestamp.fromMillis(fiveMinutesAgo))
      );
      const onlineSnapshot = await getCountFromServer(onlineQuery);
      const online = onlineSnapshot.data().count;

      setStats({
        total,
        online,
        offline: total - online
      });
      setHasFetchedStats(true);

    } catch (error) {
      console.error("Error fetching notification stats:", error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    const now = Date.now();

    // Update storage based on type
    if (config?.cooldownMinutes && config.cooldownMinutes > 0) {
        localStorage.setItem('notification_last_seen', now.toString());
    } else {
        sessionStorage.setItem('notification_closed', 'true');
    }

    // Always update the known config version so we don't treat it as "new" next time until it actually changes
    if (config?.updatedAt) {
        const time = config.updatedAt.toMillis ? config.updatedAt.toMillis() : 0;
        localStorage.setItem('notification_last_config_time', time.toString());
    }
  };

  // Function to render text with clickable links
  const renderMessageWithLinks = (text: string) => {
    // Regex to match URLs (http/https)
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Split by regex but keep delimiters (the URLs)
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        // It's a URL
        // Display text without protocol
        const displayText = part.replace(/^https?:\/\//, '');

        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline break-all font-semibold"
          >
            {displayText}
          </a>
        );
      } else {
        // Regular text
        return <span key={index}>{part}</span>;
      }
    });
  };

  if (!config || !config.enabled || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
          >
            {/* Image Section */}
            {config.imageUrl && (
              <div className="w-full h-48 bg-zinc-100 dark:bg-zinc-800 relative">
                 <img
                    src={config.imageUrl}
                    alt="Notification"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              </div>
            )}

            {/* Content Section */}
            <div className="p-6">
              {/* Close Button (Absolute top-right if image exists, otherwise regular) */}
              <button
                onClick={handleClose}
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-10
                  ${config.imageUrl ? 'bg-black/30 text-white hover:bg-black/50' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'}
                `}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Message */}
              {config.message && (
                <div className={`prose dark:prose-invert max-w-none mb-6 ${config.imageUrl ? '' : 'mt-2'}`}>
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium text-zinc-800 dark:text-zinc-200">
                    {renderMessageWithLinks(config.message)}
                  </p>
                </div>
              )}

              {/* Stats Grid */}
              {config.showStats && stats && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl flex flex-col items-center justify-center text-center border border-blue-100 dark:border-blue-900/50">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1" />
                    <span className="text-xs text-blue-600/70 dark:text-blue-400/70 font-medium">Total</span>
                    <span className="text-xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</span>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl flex flex-col items-center justify-center text-center border border-green-100 dark:border-green-900/50">
                    <Activity className="w-5 h-5 text-green-600 dark:text-green-400 mb-1" />
                    <span className="text-xs text-green-600/70 dark:text-green-400/70 font-medium">Online</span>
                    <span className="text-xl font-bold text-green-700 dark:text-green-300">{stats.online}</span>
                  </div>

                  <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl flex flex-col items-center justify-center text-center border border-zinc-200 dark:border-zinc-700">
                    <EyeOff className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mb-1" />
                    <span className="text-xs text-zinc-500/70 dark:text-zinc-400/70 font-medium">Offline</span>
                    <span className="text-xl font-bold text-zinc-700 dark:text-zinc-300">{stats.offline}</span>
                  </div>
                </div>
              )}

              {/* Action Button (Optional "OK" or "Close" main button) */}
              <div className="mt-6">
                <Button onClick={handleClose} className="w-full rounded-xl">
                  Tutup
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
