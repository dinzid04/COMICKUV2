import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Search as SearchIcon, AlertCircle } from "lucide-react";
import { api, extractManhwaId } from "@/lib/api";
import { ManhwaCard, ManhwaCardSkeleton } from "@/components/manhwa-card";
import { SEO } from "@/components/seo";

export default function SearchPage() {
  const [, params] = useRoute("/search/:query");
  const query = params?.query || "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/search", query],
    queryFn: () => api.searchManhwa(query),
    enabled: !!query,
  });

  if (!query) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-20">
        <SEO
          title="Cari Manhwa"
          description="Cari dan temukan manhwa favorit kamu. Koleksi lengkap manhwa dari berbagai genre tersedia untuk dibaca gratis."
        />
        <div className="text-center">
          <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Cari Manhwa Favorit</h2>
          <p className="text-muted-foreground">
            Gunakan search bar di atas untuk mencari manhwa
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <SEO
        title={`Hasil Pencarian: ${decodeURIComponent(query)}`}
        description={`Temukan komik ${decodeURIComponent(query)} dan komik lainnya. Baca gratis di COMIC KU.`}
      />
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">
          Hasil Pencarian: <span className="text-primary">{decodeURIComponent(query)}</span>
        </h1>
        {data && (
          <p className="text-muted-foreground">
            Ditemukan {data.seriesList.length} hasil
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
      ) : data && data.seriesList.length > 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data.seriesList.map((manhwa) => (
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
      ) : (
        <div className="text-center py-20">
          <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Tidak Ada Hasil</h2>
          <p className="text-muted-foreground">
            Tidak ditemukan manhwa dengan kata kunci "{decodeURIComponent(query)}"
          </p>
        </div>
      )}
    </div>
  );
}
