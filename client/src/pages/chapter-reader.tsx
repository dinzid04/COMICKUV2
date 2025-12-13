import { useQuery } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Home, Loader2, AlertCircle, Play, Lock, Coins } from "lucide-react";
import { api, extractChapterId } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { SEO } from "@/components/seo";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/firebaseConfig";
import { doc, setDoc, getDoc, increment, updateDoc } from "firebase/firestore";
import { AutoScrollControls } from "@/components/auto-scroll-controls";
import { XP_PER_CHAPTER } from "@/lib/gamification";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ManhwaState {
  manhwaId: string;
  manhwaTitle: string;
  manhwaImage: string;
}

export default function ChapterReader() {
  const [, params] = useRoute("/chapter/:id");
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const chapterId = params?.id || "";
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());
  const [manhwaState, setManhwaState] = useState<ManhwaState | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Locking State
  const [isLocked, setIsLocked] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [lockPrice, setLockPrice] = useState(0);
  const [checkingLock, setCheckingLock] = useState(true);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    const storedState = sessionStorage.getItem('currentManhwa');
    if (storedState) {
      setManhwaState(JSON.parse(storedState));
    }
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/chapter", chapterId],
    queryFn: () => api.getChapter(chapterId),
    enabled: !!chapterId,
  });

  // Check Lock Status
  useEffect(() => {
    const checkLockStatus = async () => {
      setCheckingLock(true);
      try {
        const lockRef = doc(db, "locked_chapters", chapterId);
        const lockSnap = await getDoc(lockRef);

        if (lockSnap.exists()) {
          const lockData = lockSnap.data();
          if (lockData.isLocked) {
            setIsLocked(true);
            setLockPrice(lockData.price || 0);

            // Check if user owns it
            if (user) {
               const unlockRef = doc(db, "users", user.uid, "unlocked_chapters", chapterId);
               const unlockSnap = await getDoc(unlockRef);
               if (unlockSnap.exists()) {
                  setIsUnlocked(true);
               }
            }
          }
        }
      } catch (e) {
         console.error("Lock check error", e);
      } finally {
         setCheckingLock(false);
      }
    };
    checkLockStatus();
  }, [chapterId, user]);

  const handleUnlock = async () => {
      if (!user) {
          toast({ title: "Login required", description: "Please login to unlock chapters." });
          return;
      }
      setUnlocking(true);
      try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
             throw new Error("User not found");
          }

          const userData = userSnap.data();
          const userCoins = userData.coins || 0;

          if (userCoins < lockPrice) {
             toast({ title: "Insufficient Coins", description: "You don't have enough coins.", variant: "destructive" });
             setUnlocking(false);
             return;
          }

          // Deduct coins and unlock
          // Note: In production this should be a Transaction or Cloud Function to be safe
          await updateDoc(userRef, {
             coins: increment(-lockPrice)
          });

          const unlockRef = doc(db, "users", user.uid, "unlocked_chapters", chapterId);
          await setDoc(unlockRef, {
             unlockedAt: new Date(),
             pricePaid: lockPrice
          });

          setIsUnlocked(true);
          toast({ title: "Chapter Unlocked!", description: "Happy reading!" });

      } catch (e) {
          console.error("Unlock failed", e);
          toast({ title: "Error", description: "Failed to unlock chapter.", variant: "destructive" });
      } finally {
          setUnlocking(false);
      }
  };

  // Scroll to top when chapter changes and save history
  useEffect(() => {
    if (isLocked && !isUnlocked) return; // Don't track history if locked
    // Restore scroll position logic
    const savedScrollPos = localStorage.getItem(`scroll_pos_${chapterId}`);
    if (savedScrollPos) {
      window.scrollTo(0, parseInt(savedScrollPos));
    } else {
      window.scrollTo(0, 0);
    }

    if (user && manhwaState && data?.title) {
      const saveHistory = async () => {
        const historyRef = doc(db, "users", user.uid, "history", manhwaState.manhwaId);
        try {
          await setDoc(historyRef, {
            manhwaId: manhwaState.manhwaId,
            manhwaTitle: manhwaState.manhwaTitle,
            manhwaImage: manhwaState.manhwaImage,
            lastChapterId: chapterId,
            lastChapterTitle: data.title,
            readAt: new Date(),
          }, { merge: true });
        } catch (error) {
          console.error("Error saving history:", error);
        }
      };
      const incrementChaptersRead = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const leaderboardDocRef = doc(db, 'leaderboard', user.uid);
        try {
          // Increment chapters read AND XP
          await setDoc(userDocRef, {
            chaptersRead: increment(1),
            xp: increment(XP_PER_CHAPTER)
          }, { merge: true });

          // Update leaderboard
          const userDoc = await getDoc(userDocRef);
          if(userDoc.exists()){
            const userData = userDoc.data();
            await setDoc(leaderboardDocRef, {
              chaptersRead: userData.chaptersRead,
              xp: userData.xp || 0, // Sync XP to leaderboard
              nickname: userData.nickname,
              photoUrl: userData.photoUrl,
              uid: user.uid
            }, { merge: true });

            // Optional: Check for level up notification could go here if we tracked previous level
          }
        } catch (error) {
          console.error("Error incrementing chapters/xp:", error);
        }
      };
      saveHistory();
      incrementChaptersRead();
    }

    // Save scroll position on unmount
    return () => {
       localStorage.setItem(`scroll_pos_${chapterId}`, window.scrollY.toString());
    };
  }, [chapterId, user, data, manhwaState]);

  // Periodic scroll save (in case of crash/tab close)
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(`scroll_pos_${chapterId}`, window.scrollY.toString());
    }, 5000);
    return () => clearInterval(interval);
  }, [chapterId]);

  const handleImageError = (index: number) => {
    setImageLoadErrors(prev => new Set(prev).add(index));
  };

  const handlePrevChapter = () => {
    if (data?.prevSlug) {
      const prevId = extractChapterId(data.prevSlug);
      navigate(`/chapter/${prevId}`);
    }
  };

  const handleNextChapter = () => {
    if (data?.nextSlug) {
      const nextId = extractChapterId(data.nextSlug);
      navigate(`/chapter/${nextId}`);
    }
  };

  const startScrolling = () => {
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    scrollIntervalRef.current = setInterval(() => {
      window.scrollBy(0, 1);
    }, 10 / scrollSpeed);
  };

  const stopScrolling = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const toggleScrolling = () => {
    setIsScrolling(prev => !prev);
  };

  useEffect(() => {
    if (isScrolling) {
      startScrolling();
    } else {
      stopScrolling();
    }
    return () => stopScrolling();
  }, [isScrolling, scrollSpeed]);

  if (isLoading || checkingLock) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Chapter Tidak Ditemukan</h2>
        <p className="text-muted-foreground mb-6">Chapter yang kamu cari tidak tersedia</p>
        <Link 
          href="/"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 min-h-9 px-4 py-2"
        >
          Kembali ke Home
        </Link>
      </div>
    );
  }

  if (isLocked && !isUnlocked) {
     return (
        <div className="min-h-screen bg-black flex flex-col">
           {/* Header - Fixed */}
            <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="container mx-auto max-w-4xl px-4 py-3">
                <div className="flex items-center justify-between">
                    <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground min-h-8 px-3 py-2"
                    >
                    <Home className="h-4 w-4" />
                    <span className="hidden sm:inline">Home</span>
                    </Link>
                    <h1 className="font-semibold text-sm sm:text-base text-center flex-1 mx-4 line-clamp-1">
                    {data.title}
                    </h1>
                </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 text-center">
                <div className="p-6 bg-muted/10 rounded-full border border-muted/20">
                    <Lock className="h-16 w-16 text-primary" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold mb-2 text-white">Chapter Locked</h2>
                    <p className="text-muted-foreground">You need to unlock this chapter to continue reading.</p>
                </div>

                <div className="bg-card p-6 rounded-xl border border-border w-full max-w-sm">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-sm font-medium text-muted-foreground">Price</span>
                        <div className="flex items-center gap-2 text-yellow-500">
                             <Coins className="h-5 w-5 fill-current" />
                             <span className="text-2xl font-bold">{lockPrice}</span>
                        </div>
                    </div>

                    {!user ? (
                         <Button className="w-full" asChild>
                            <Link href="/login">Login to Unlock</Link>
                         </Button>
                    ) : (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-12">
                                    Unlock Now <Lock className="ml-2 h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Unlock Chapter</DialogTitle>
                                    <DialogDescription>
                                        Use {lockPrice} coins to unlock <strong>{data.title}</strong>?
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button onClick={handleUnlock} disabled={unlocking} className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black">
                                        {unlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Unlock"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-black">
      <SEO
        title={data.title}
        description={`Baca ${data.title} online gratis. ${data.images?.length || 0} halaman tersedia.`}
      />

      {showControls && (
        <AutoScrollControls
          isScrolling={isScrolling}
          scrollSpeed={scrollSpeed}
          onToggleScroll={toggleScrolling}
          onSpeedChange={setScrollSpeed}
          onHide={() => setShowControls(false)}
        />
      )}

      {/* Header - Fixed */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground min-h-8 px-3 py-2"
              data-testid="button-home"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <h1 className="font-semibold text-sm sm:text-base text-center flex-1 mx-4 line-clamp-1">
              {data.title}
            </h1>
            <div className="w-20 flex justify-end items-center">
              {!showControls && (
                <Button
                  onClick={() => setShowControls(true)}
                  size="icon"
                  variant="ghost"
                  data-testid="show-controls-button"
                >
                  <Play className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Images - Vertical Scroll */}
      <div className="container mx-auto max-w-4xl px-0 py-0">
        {data.images && data.images.length > 0 ? (
          <div className="space-y-0">
            {data.images.map((image, index) => (
              <div key={index} className="relative w-full" data-testid={`image-chapter-${index}`}>
                {imageLoadErrors.has(index) ? (
                  <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">Gambar tidak dapat dimuat</p>
                  </div>
                ) : (
                  <img
                    src={image}
                    alt={`${data.title} - Page ${index + 1}`}
                    className="w-full h-auto"
                    loading={index < 3 ? "eager" : "lazy"}
                    onError={() => handleImageError(index)}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-white">
            Tidak ada gambar tersedia
          </div>
        )}
      </div>

      {/* Navigation - Fixed Bottom */}
      <div className="sticky bottom-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={handlePrevChapter}
              disabled={!data.prevSlug}
              variant="outline"
              className="gap-2 flex-1 sm:flex-none"
              data-testid="button-prev-chapter"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="text-center flex-1">
              <p className="text-sm text-muted-foreground">
                {data.images?.length || 0} halaman
              </p>
            </div>

            <Button
              onClick={handleNextChapter}
              disabled={!data.nextSlug}
              className="gap-2 flex-1 sm:flex-none"
              data-testid="button-next-chapter"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
