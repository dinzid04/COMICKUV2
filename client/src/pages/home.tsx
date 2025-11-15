import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronRight, Flame, TrendingUp, Clock, BookOpen } from "lucide-react";
import { api } from "@/lib/api";
import { ManhwaSlider } from "@/components/manhwa-slider";
import { ManhwaCard, ManhwaCardSkeleton } from "@/components/manhwa-card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";
import { WelcomeSlider } from "@/components/welcome-slider";

export default function Home() {
  const { data: recommendationsData, isLoading: loadingRec } = useQuery({
    queryKey: ["manhwa-recommendation"],
    queryFn: api.getManhwaRecommendation,
  });

  const { data: newManhwaData, isLoading: loadingNew } = useQuery({
    queryKey: ["manhwa-new"],
    queryFn: () => api.getManhwaNew(1),
  });

  const { data: popularManhwaData, isLoading: loadingPopular } = useQuery({
    queryKey: ["manhwa-popular"],
    queryFn: () => api.getManhwaPopular(1),
  });

  const { data: mangaData, isLoading: loadingManga } = useQuery({
    queryKey: ["manhwa-manga"],
    queryFn: () => api.getManhwaManga(1),
  });

  const { data: comicData, isLoading: loadingComic } = useQuery({
    queryKey: ["manhwa-comic"],
    queryFn: () => api.getManhwaComic(1),
  });

  const { data: manhuaData, isLoading: loadingManhua } = useQuery({
    queryKey: ["manhwa-manhua"],
    queryFn: () => api.getManhwaManhua(1),
  });

  const { data: topManhwaData, isLoading: loadingTop } = useQuery({
    queryKey: ["manhwa-top"],
    queryFn: api.getManhwaTop,
  });

  const recommendations = recommendationsData?.results;
  const newManhwa = newManhwaData?.results;
  const popularManhwa = popularManhwaData?.results;
  const manga = mangaData?.results;
  const comic = comicData?.results;
  const manhua = manhuaData?.results;
  const topManhwa = topManhwaData?.recommendations;

  return (
    <div className="min-h-screen">
      <SEO
        title="Beranda - Baca Manhwa Gratis"
        description="Baca manhwa terbaru, populer, dan top rated gratis online. Nikmati koleksi lengkap manhwa berkualitas tinggi dengan update terbaru setiap hari."
      />
      {/* Hero Slider */}
      <section className="mb-12">
        {loadingRec ? (
          <div className="h-[400px] md:h-[500px] rounded-lg bg-muted animate-pulse" />
        ) : recommendations && recommendations.length > 0 ? (
          <ManhwaSlider manhwaList={recommendations} />
        ) : null}
      </section>

      <div className="container mx-auto max-w-7xl px-4 space-y-12">
        {/* Welcome Slider */}
        <section className="mb-8">
          <WelcomeSlider />
        </section>

        {/* Terbaru Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              <h2 className="font-display text-3xl font-bold">Terbaru</h2>
            </div>
            <Link href="/list/new">
              <Button variant="outline" className="gap-2">
                Lihat Semua <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loadingNew
              ? Array.from({ length: 12 }).map((_, i) => <ManhwaCardSkeleton key={i} />)
              : newManhwa?.slice(0, 12).map((manhwa) => (
                  <ManhwaCard
                    key={manhwa.slug}
                    id={manhwa.slug}
                    title={manhwa.title}
                    imageSrc={manhwa.imageSrc}
                    chapter={manhwa.latestChapter}
                  />
                ))}
          </div>
        </section>

        {/* Populer Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Flame className="h-6 w-6 text-primary" />
              <h2 className="font-display text-3xl font-bold">Populer</h2>
            </div>
             <Link href="/list/popular">
              <Button variant="outline" className="gap-2">
                Lihat Semua <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loadingPopular
              ? Array.from({ length: 12 }).map((_, i) => <ManhwaCardSkeleton key={i} />)
              : popularManhwa?.slice(0, 12).map((manhwa) => (
                  <ManhwaCard
                    key={manhwa.slug}
                    id={manhwa.slug}
                    title={manhwa.title}
                    imageSrc={manhwa.imageSrc}
                    rating={manhwa.rating}
                    chapter={manhwa.chapter}
                  />
                ))}
          </div>
        </section>

        {/* Manga Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="font-display text-3xl font-bold">Manga</h2>
            </div>
            <Link href="/list/manga">
              <Button variant="outline" className="gap-2">
                Lihat Semua <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loadingManga
              ? Array.from({ length: 12 }).map((_, i) => <ManhwaCardSkeleton key={i} />)
              : manga?.slice(0, 12).map((manhwa) => (
                  <ManhwaCard
                    key={manhwa.slug}
                    id={manhwa.slug}
                    title={manhwa.title}
                    imageSrc={manhwa.imageSrc}
                    chapter={manhwa.latestChapter}
                  />
                ))}
          </div>
        </section>

        {/* Comic Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="font-display text-3xl font-bold">Comic</h2>
            </div>
            <Link href="/list/comic">
              <Button variant="outline" className="gap-2">
                Lihat Semua <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loadingComic
              ? Array.from({ length: 12 }).map((_, i) => <ManhwaCardSkeleton key={i} />)
              : comic?.slice(0, 12).map((manhwa) => (
                  <ManhwaCard
                    key={manhwa.slug}
                    id={manhwa.slug}
                    title={manhwa.title}
                    imageSrc={manhwa.imageSrc}
                    chapter={manhwa.latestChapter}
                  />
                ))}
          </div>
        </section>

        {/* Manhua Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="font-display text-3xl font-bold">Manhua</h2>
            </div>
            <Link href="/list/manhua">
              <Button variant="outline" className="gap-2">
                Lihat Semua <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loadingManhua
              ? Array.from({ length: 12 }).map((_, i) => <ManhwaCardSkeleton key={i} />)
              : manhua?.slice(0, 12).map((manhwa) => (
                  <ManhwaCard
                    key={manhwa.slug}
                    id={manhwa.slug}
                    title={manhwa.title}
                    imageSrc={manhwa.imageSrc}
                    chapter={manhwa.latestChapter}
                  />
                ))}
          </div>
        </section>

        {/* Top Rated Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="font-display text-3xl font-bold">Top Rated</h2>
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loadingTop
              ? Array.from({ length: 12 }).map((_, i) => <ManhwaCardSkeleton key={i} />)
              : topManhwa?.slice(0, 12).map((manhwa) => (
                  <ManhwaCard
                    key={manhwa.slug}
                    id={manhwa.slug}
                    title={manhwa.title}
                    image={manhwa.image}
                    rating={manhwa.rating}
                  />
                ))}
          </div>
        </section>
      </div>
    </div>
  );
}
