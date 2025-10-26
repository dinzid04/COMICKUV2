import { useQuery } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Home, Loader2, AlertCircle } from "lucide-react";
import { api, extractChapterId } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { SEO } from "@/components/seo";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

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

  useEffect(() => {
    const state = location.state as ManhwaState;
    if (state?.manhwaId) {
      sessionStorage.setItem('currentManhwa', JSON.stringify(state));
      setManhwaState(state);
    } else {
      const storedState = sessionStorage.getItem('currentManhwa');
      if (storedState) {
        setManhwaState(JSON.parse(storedState));
      }
    }
  }, [location.state]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/chapter", chapterId],
    queryFn: () => api.getChapter(chapterId),
    enabled: !!chapterId,
  });

  // Scroll to top when chapter changes and save history
  useEffect(() => {
    window.scrollTo(0, 0);

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
      saveHistory();
    }
  }, [chapterId, user, data, manhwaState]);

  const handleImageError = (index: number) => {
    setImageLoadErrors(prev => new Set(prev).add(index));
  };

  const handlePrevChapter = () => {
    if (data?.prevChapter) {
      const prevId = extractChapterId(data.prevChapter);
      navigate(`/chapter/${prevId}`, { state: manhwaState });
    }
  };

  const handleNextChapter = () => {
    if (data?.nextChapter) {
      const nextId = extractChapterId(data.nextChapter);
      navigate(`/chapter/${nextId}`, { state: manhwaState });
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

  return (
    <div className="min-h-screen bg-black">
      <SEO
        title={data.title}
        description={`Baca ${data.title} online gratis. ${data.images?.length || 0} halaman tersedia.`}
      />
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
            <div className="w-20"></div>
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
              disabled={!data.prevChapter}
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
              disabled={!data.nextChapter}
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
