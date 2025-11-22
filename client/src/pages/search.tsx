import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Search as SearchIcon, AlertCircle } from "lucide-react";
import { api, extractManhwaId } from "@/lib/api";
import { ManhwaCard, ManhwaCardSkeleton } from "@/components/manhwa-card";
import AnimeCard from "@/components/anime/AnimeCard";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";

type SearchType = "comic" | "anime";

export default function SearchPage() {
  const [, params] = useRoute("/search/:query");
  const query = params?.query || "";
  const [searchType, setSearchType] = useState<SearchType>("comic");

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/search", searchType, query],
    queryFn: () => {
      if (searchType === "comic") {
        return api.searchManhwa(query);
      } else {
        return api.searchAnime(query);
      }
    },
    enabled: !!query,
  });

  if (!query) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-20">
        <SEO
          title="Cari Manhwa & Anime"
          description="Cari dan temukan manhwa dan anime favorit kamu. Koleksi lengkap dari berbagai genre tersedia gratis."
        />
        <div className="text-center">
          <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Cari Manhwa atau Anime Favorit</h2>
          <p className="text-muted-foreground">
            Gunakan search bar di atas untuk memulai pencarian
          </p>
        </div>
      </div>
    );
  }

  const comicResults = searchType === 'comic' && data && 'seriesList' in data ? data.seriesList : [];
  const animeResults = searchType === 'anime' && data && 'results' in data ? data.results : [];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <SEO
        title={`Hasil Pencarian: ${decodeURIComponent(query)}`}
        description={`Temukan hasil untuk ${decodeURIComponent(query)}. Baca atau tonton gratis di COMIC KU.`}
      />
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">
          Hasil Pencarian: <span className="text-primary">{decodeURIComponent(query)}</span>
        </h1>
        <div className="flex gap-2 mb-4">
          <Button onClick={() => setSearchType("comic")} variant={searchType === "comic" ? "default" : "outline"}>
            Komik
          </Button>
          <Button onClick={() => setSearchType("anime")} variant={searchType === "anime" ? "default" : "outline"}>
            Anime
          </Button>
        </div>
        {data && (
          <p className="text-muted-foreground">
            Ditemukan {searchType === 'comic' ? comicResults.length : animeResults.length} hasil
          </p>
        )}
      </div>

      {error ? (
        <div className="text-center py-20">
          <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h2>
          <p className="text-muted-foreground">Gagal memuat hasil pencarian</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <ManhwaCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {searchType === "comic" && comicResults.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {comicResults.map((manhwa) => (
                <ManhwaCard
                  key={manhwa.slug}
                  id={extractManhwaId(manhwa.slug)}
                  title={manhwa.title}
                  image={manhwa.image}
                  rating={manhwa.rating}
                  latestChapter={manhwa.latestChapter}
                />
              ))}
            </div>
          )}
          {searchType === "anime" && animeResults.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {animeResults.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  id={anime.id}
                  slug={anime.slug}
                  title={anime.title}
                  image={anime.image}
                  score={anime.rating}
                  type={anime.type}
                />
              ))}
            </div>
          )}
          {(searchType === 'comic' && comicResults.length === 0) || (searchType === 'anime' && animeResults.length === 0) ? (
            <div className="text-center py-20">
              <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Tidak Ada Hasil</h2>
              <p className="text-muted-foreground">
                Tidak ditemukan {searchType === 'comic' ? 'manhwa' : 'anime'} dengan kata kunci "{decodeURIComponent(query)}"
              </p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
