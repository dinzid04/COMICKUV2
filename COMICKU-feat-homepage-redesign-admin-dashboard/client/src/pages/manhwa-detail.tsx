import { useQuery } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Star, Calendar, User, Book, Tag, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { api, extractChapterId } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/seo";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/firebaseConfig";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ManhwaDetail() {
  const [, params] = useRoute("/manhwa/:id");
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const fallbackImage = searchParams.get("image");

  const manhwaId = params?.id || "";
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/manhwa-detail", manhwaId],
    queryFn: () => api.getManhwaDetail(manhwaId),
    enabled: !!manhwaId,
  });

  useEffect(() => {
    if (!user || !data) return;
    const checkFavorite = async () => {
      const docRef = doc(db, "users", user.uid, "favorites", manhwaId);
      const docSnap = await getDoc(docRef);
      setIsFavorite(docSnap.exists());
    };
    checkFavorite();
  }, [user, data, manhwaId]);

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
          id: manhwaId,
          title: data.title,
          image: displayImage,
          addedAt: new Date(),
        });
        toast({ title: "Added to Favorites" });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
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

  // Handle inconsistent image property names and fallback to query param
  const displayImage = data.imageSrc || (data as any).image || fallbackImage;

  const sortedChapters = data.chapters
    ? [...data.chapters].sort((a, b) => {
        const numA = parseFloat(a.chapterNum.replace(/[^0-9.]/g, ''));
        const numB = parseFloat(b.chapterNum.replace(/[^0-9.]/g, ''));
        return numA - numB;
      })
    : [];

  const firstChapterLink = sortedChapters.length > 0 ? sortedChapters[0].chapterLink : data.firstChapter?.link;

  const handleChapterClick = (chapterLink: string) => {
    if (!data) return;
    const chapterId = extractChapterId(chapterLink);
    navigate(`/chapter/${chapterId}`, {
      state: {
        manhwaId: manhwaId,
        manhwaTitle: data.title,
        manhwaImage: displayImage,
      }
    });
  };

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
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://placehold.co/300x450/1a1a2e/7c3aed?text=${encodeURIComponent(data.title.slice(0, 20))}`;
                  }}
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
                {data.released && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Released: <span className="text-foreground font-medium">{data.released}</span></span>
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
                      <Badge key={genre.genreName} variant="secondary">
                        {genre.genreName}
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
              {firstChapterLink && (
                <Button
                  onClick={() => handleChapterClick(firstChapterLink!)}
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
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {sortedChapters.length > 0 ? (
            <div className="divide-y divide-border">
              {sortedChapters.map((chapter, index) => {
                return (
                  <div
                    key={index}
                    onClick={() => handleChapterClick(chapter.chapterLink)}
                    className="flex items-center justify-between p-4 hover-elevate active-elevate-2 transition-all cursor-pointer"
                    data-testid={`link-chapter-${extractChapterId(chapter.chapterLink)}`}
                  >
                    <div>
                      <h3 className="font-semibold">{chapter.chapterNum}</h3>
                      <p className="text-sm text-muted-foreground">{chapter.chapterDate}</p>
                    </div>
                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Tidak ada chapter tersedia
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
