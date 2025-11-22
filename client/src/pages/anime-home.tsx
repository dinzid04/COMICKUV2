import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronRight, Flame, Clock, Film } from "lucide-react";
import { api } from "@/lib/api";
import { SEO } from "@/components/seo";
import { ManhwaCardSkeleton } from "@/components/manhwa-card";
import { Button } from "@/components/ui/button";
import { AnimeCard } from "@/components/anime-card";
import { AnimeHero } from "@/components/anime-hero";

export default function AnimeHome() {
  const { data: animeHomeData, isLoading: loadingAnimeHome } = useQuery({
    queryKey: ["anime-home"],
    queryFn: api.getAnimeHome,
  });

  const { data: movieData, isLoading: loadingMovie } = useQuery({
    queryKey: ["anime-movie-random"],
    queryFn: () => api.getAnimeMovie(Math.floor(Math.random() * 2) + 1),
  });

  const heroData = movieData?.animes;
  const ongoing = animeHomeData?.ongoing;
  const completed = animeHomeData?.completed;
  const movie = animeHomeData?.movie;

  // Fungsi untuk membersihkan URL yang diakhiri dengan titik
  const cleanImageUrl = (url: string) => {
    if (url.endsWith('.')) {
      return url.slice(0, -1);
    }
    return url;
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Anime - Nonton Anime Gratis"
        description="Nonton anime terbaru, populer, dan tamat gratis online. Nikmati koleksi lengkap anime berkualitas tinggi dengan update terbaru setiap hari."
      />
      {/* Hero Slider */}
      <section className="mb-12">
        {loadingMovie ? (
          <div className="h-[400px] md:h-[500px] rounded-lg bg-muted animate-pulse" />
        ) : heroData && heroData.length > 0 ? (
          <AnimeHero animes={heroData} />
        ) : null}
      </section>

      <div className="container mx-auto max-w-7xl px-4 space-y-12">
        {/* Ongoing Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              <h2 className="font-display text-3xl font-bold">Ongoing</h2>
            </div>
            <Link href="/anime/list/ongoing">
              <Button variant="outline" className="gap-2">
                Lihat Semua <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loadingAnimeHome
              ? Array.from({ length: 12 }).map((_, i) => <ManhwaCardSkeleton key={i} />)
              : ongoing?.slice(0, 12).map((anime) => (
                  <AnimeCard
                    key={anime.slug}
                    id={anime.id}
                    slug={anime.slug}
                    title={anime.title}
                    imageSrc={cleanImageUrl(anime.image)}
                    episode={anime.episode}
                  />
                ))}
          </div>
        </section>

        {/* Completed Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Flame className="h-6 w-6 text-primary" />
              <h2 className="font-display text-3xl font-bold">Completed</h2>
            </div>
            <Link href="/anime/list/finished">
              <Button variant="outline" className="gap-2">
                Lihat Semua <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loadingAnimeHome
              ? Array.from({ length: 12 }).map((_, i) => <ManhwaCardSkeleton key={i} />)
              : completed?.slice(0, 12).map((anime) => (
                  <AnimeCard
                    key={anime.slug}
                    id={anime.id}
                    slug={anime.slug}
                    title={anime.title}
                    imageSrc={cleanImageUrl(anime.image)}
                    rating={anime.rating}
                  />
                ))}
          </div>
        </section>

        {/* Movie Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Film className="h-6 w-6 text-primary" />
              <h2 className="font-display text-3xl font-bold">Movie</h2>
            </div>
            <Link href="/anime/list/movie">
              <Button variant="outline" className="gap-2">
                Lihat Semua <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loadingAnimeHome
              ? Array.from({ length: 12 }).map((_, i) => <ManhwaCardSkeleton key={i} />)
              : movie?.slice(0, 12).map((anime) => (
                  <AnimeCard
                    key={anime.slug}
                    id={anime.id}
                    slug={anime.slug}
                    title={anime.title}
                    imageSrc={cleanImageUrl(anime.image)}
                    rating={anime.rating}
                  />
                ))}
          </div>
        </section>
      </div>
    </div>
  );
}
