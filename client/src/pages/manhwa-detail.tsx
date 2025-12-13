import { useQuery } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Star, Calendar, User, Book, Tag, ExternalLink, Loader2, AlertCircle, Coins, Lock, Check } from "lucide-react";
import { api, extractChapterId } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/seo";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/firebaseConfig";
import { doc, setDoc, deleteDoc, getDoc, collection, query, where, getDocs, updateDoc, increment } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CommentSection from "@/components/CommentSection";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ManhwaDetail() {
  const [, params] = useRoute("/manhwa/:id");
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const fallbackImage = searchParams.get("image");

  const manhwaId = params?.id || "";
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [lockedChapters, setLockedChapters] = useState<Record<string, {price: number}>>({});
  const [unlockedChapters, setUnlockedChapters] = useState<Set<string>>(new Set());

  // Unlock Dialog State
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<{slug: string, id: string, price: number, title: string} | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["manhwa-detail", manhwaId],
    queryFn: () => api.getManhwaDetail(manhwaId),
    enabled: !!manhwaId,
  });

  // Check Favorite Status
  useEffect(() => {
    if (!user || !data) return;
    const checkFavorite = async () => {
      const docRef = doc(db, "users", user.uid, "favorites", manhwaId);
      const docSnap = await getDoc(docRef);
      setIsFavorite(docSnap.exists());
    };
    checkFavorite();
  }, [user, data, manhwaId]);

  // Check Locked Chapters for this Manhwa
  useEffect(() => {
    // If we have manhwaId, fetch any locked chapters associated with it
    const fetchLocks = async () => {
      // 1. Fetch from locked_chapters where manhwaId == manhwaId
      // Note: This requires an index. If not present, we might just fetch individual IDs if we had them,
      // but simpler to rely on the admin saving manhwaId.
      try {
        const q = query(collection(db, "locked_chapters"), where("manhwaId", "==", manhwaId));
        const querySnapshot = await getDocs(q);
        const locks: Record<string, {price: number}> = {};
        querySnapshot.forEach((doc) => {
           // Key by chapter ID (slug part)
           locks[doc.id] = { price: doc.data().price };
        });
        setLockedChapters(locks);

        // 2. If user logged in, check which they unlocked
        if (user) {
           const unlockedSet = new Set<string>();
           // We can't easily query all subcollections efficiently without knowing IDs,
           // but we can query "unlocked_chapters" collection group or just iterate if not too many.
           // Better: Query "users/{uid}/unlocked_chapters" - get all docs
           // Since we don't store manhwaId in unlocked_chapters (only chapterId as key), we fetch all.
           // This might be large over time.
           // Optimization: Check specifically for chapters in 'locks' map.

           if (Object.keys(locks).length > 0) {
              // Only check the ones that are locked
              await Promise.all(Object.keys(locks).map(async (chapId) => {
                 const snap = await getDoc(doc(db, "users", user.uid, "unlocked_chapters", chapId));
                 if(snap.exists()) unlockedSet.add(chapId);
              }));
              setUnlockedChapters(unlockedSet);
           }
        }

      } catch (e) {
        console.error("Error fetching locks", e);
      }
    };
    fetchLocks();
  }, [manhwaId, user]);

  const displayImage = data?.imageSrc || fallbackImage || '';

  const toggleFavorite = async () => {
    if (!user || !data) {
      toast({ title: "Login Required", description: "You need to be logged in to add favorites.", variant: "destructive" });
      return;
    }

    const docRef = doc(db, "users", user.uid, "favorites", manhwaId);

    try {
      if (isFavorite) {
        await deleteDoc(docRef);
        toast({ title: "Removed from Favorites" });
      } else {
        await setDoc(docRef, {
          slug: manhwaId,
          title: data.title,
          imageSrc: displayImage,
          addedAt: new Date(),
        });
        toast({ title: "Added to Favorites" });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    }
  };

  const handleChapterClick = (chapterSlug: string, isLocked: boolean, isUnlocked: boolean, price: number, title: string) => {
    if (!data || !displayImage) return;
    const chapterId = extractChapterId(chapterSlug);

    // If locked and not unlocked, open dialog instead of navigating
    if (isLocked && !isUnlocked) {
        if (!user) {
            toast({ title: "Login Required", description: "Please login to unlock chapters." });
            return;
        }
        setSelectedChapter({ slug: chapterSlug, id: chapterId, price, title });
        setUnlockDialogOpen(true);
        return;
    }

    // Save manhwa details to session storage for the reader page
    sessionStorage.setItem('currentManhwa', JSON.stringify({
      manhwaId: manhwaId,
      manhwaTitle: data.title,
      manhwaImage: displayImage,
    }));
    navigate(`/chapter/${chapterId}`);
  };

  const handleUnlockConfirm = async () => {
    if (!user || !selectedChapter) return;
    setUnlocking(true);
    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return;

        const userData = userSnap.data();
        const userCoins = userData.coins || 0;

        if (userCoins < selectedChapter.price) {
            toast({ title: "Insufficient Coins", description: "You need more coins.", variant: "destructive" });
            setUnlocking(false);
            return;
        }

        // Deduct coins
        await updateDoc(userRef, {
            coins: increment(-selectedChapter.price)
        });

        // Record unlock
        const unlockRef = doc(db, "users", user.uid, "unlocked_chapters", selectedChapter.id);
        await setDoc(unlockRef, {
            unlockedAt: new Date(),
            pricePaid: selectedChapter.price
        });

        // Update local state
        setUnlockedChapters(prev => new Set(prev).add(selectedChapter.id));
        toast({ title: "Unlocked!", description: `You can now read ${selectedChapter.title}` });
        setUnlockDialogOpen(false);

        // Optionally navigate immediately
        // handleChapterClick(selectedChapter.slug, false, true, 0, selectedChapter.title);

    } catch (e) {
        console.error("Unlock error", e);
        toast({ title: "Error", description: "Failed to unlock.", variant: "destructive" });
    } finally {
        setUnlocking(false);
    }
  };

  if (isLoading) {
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
        <h2 className="text-2xl font-bold mb-2">Manhwa Tidak Ditemukan</h2>
        <p className="text-muted-foreground mb-6">Manhwa yang kamu cari tidak tersedia</p>
        <Link 
          href="/"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 min-h-9 px-4 py-2"
        >
          Kembali ke Home
        </Link>
      </div>
    );
  }

  const firstChapterSlug = data.chapters && data.chapters.length > 0 ? data.chapters[0].slug : undefined;

  return (
    <div className="min-h-screen">
      <SEO
        title={data.title}
        description={data.synopsis.slice(0, 160) + "..."}
        image={displayImage}
      />
      {/* Hero Section with Cover */}
      <div className="bg-gradient-to-b from-card to-background border-b border-border">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover Image */}
            <div className="flex-shrink-0">
              <div className="w-64 mx-auto md:mx-0">
                <img
                  src={displayImage}
                  alt={data.title}
                  className="w-full rounded-lg shadow-xl"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                {data.title}
              </h1>

              {data.alternative && (
                <p className="text-muted-foreground mb-4">{data.alternative}</p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mb-6">
                {data.rating && (
                  <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">{data.rating}</span>
                  </div>
                )}
                <Badge variant={data.status === "Ongoing" ? "default" : "secondary"}>
                  {data.status}
                </Badge>
                <Badge variant="outline">{data.type}</Badge>
              </div>

              {/* Additional Info */}
              <div className="space-y-2 mb-6 text-sm">
                {data.author && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Author: <span className="text-foreground font-medium">{data.author}</span></span>
                  </div>
                )}
                {data.updatedOn && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Updated on: <span className="text-foreground font-medium">{data.updatedOn}</span></span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {data.genres && data.genres.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Genres:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.genres.map((genre) => (
                      <Badge key={genre.slug} variant="secondary">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Synopsis */}
              <div className="mb-6">
                <h2 className="font-semibold mb-3">Synopsis</h2>
                <p className="text-muted-foreground leading-relaxed max-w-3xl">
                  {data.synopsis}
                </p>
              </div>

              {/* Read Button */}
              {firstChapterSlug && (
                <Button
                  onClick={() => handleChapterClick(firstChapterSlug)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 min-h-10 px-8"
                  data-testid="button-read-first"
                >
                  <Book className="h-5 w-5" />
                  Baca Chapter Pertama
                </Button>
              )}
              {user && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFavorite}
                  className="ml-4"
                  aria-label="Toggle Favorite"
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chapter List */}
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <h2 className="font-display text-2xl font-bold mb-6">Daftar Chapter</h2>
        <div>
          {data.chapters && data.chapters.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.chapters.map((chapter) => {
                const chapterId = extractChapterId(chapter.slug);
                const isLockedInfo = lockedChapters[chapterId];
                const isLocked = !!isLockedInfo;
                const isUnlocked = unlockedChapters.has(chapterId);

                return (
                <div
                  key={chapter.slug}
                  onClick={() => handleChapterClick(chapter.slug, isLocked, isUnlocked, isLockedInfo?.price || 0, chapter.title)}
                  className={`
                    relative flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group
                    ${isLocked && !isUnlocked
                        ? 'bg-muted/10 border-muted/20 opacity-90 hover:bg-muted/20'
                        : 'bg-card/50 border-border/50 hover:bg-accent hover:border-accent hover:shadow-sm'
                    }
                  `}
                  data-testid={`link-chapter-${chapter.slug}`}
                >
                  <div>
                    <h3 className={`text-base font-medium flex items-center gap-2 transition-colors ${isLocked && !isUnlocked ? 'text-muted-foreground' : 'group-hover:text-primary'}`}>
                      {chapter.title}
                      {isLocked && !isUnlocked && (
                          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/20 text-xs px-2 py-0.5 h-auto">
                            <Coins className="w-3 h-3 mr-1" /> {isLockedInfo.price}
                          </Badge>
                      )}
                      {isLocked && isUnlocked && (
                           <Badge variant="outline" className="text-green-500 border-green-500/50 text-xs px-2 py-0.5 h-auto">
                               <Check className="w-3 h-3 mr-1" /> Unlocked
                           </Badge>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{chapter.date}</p>
                  </div>
                  {isLocked && !isUnlocked ? (
                      <Lock className="h-5 w-5 text-muted-foreground/50" />
                  ) : (
                      <ExternalLink className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  )}
                </div>
              )})}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground bg-card border border-border rounded-lg">
              Tidak ada chapter tersedia
            </div>
          )}
        </div>
      </div>

      {/* Unlock Dialog */}
      <Dialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Unlock Chapter</DialogTitle>
                <DialogDescription>
                    Unlock <strong>{selectedChapter?.title}</strong> for {selectedChapter?.price} Coins?
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setUnlockDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUnlockConfirm} disabled={unlocking} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                    {unlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unlock Now"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comment Section */}
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <CommentSection comicSlug={manhwaId} />
      </div>
    </div>
  );
}
