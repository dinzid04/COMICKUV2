import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { api } from "@/lib/api";
import { ManhwaCard } from "@/components/manhwa-card";
import { Loader2, AlertCircle } from "lucide-react";
import { SEO } from "@/components/seo";

export default function GenreDetailPage() {
  const params = useParams();
  const genre = params.name || "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["manhwaByGenre", genre],
    queryFn: () => api.getManhwaByGenre(genre),
    enabled: !!genre,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Memuat komik...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h2>
        <p className="text-muted-foreground">Gagal memuat komik untuk genre ini.</p>
      </div>
    );
  }

  const { seriesList } = data;
  const capitalizedGenre = genre.charAt(0).toUpperCase() + genre.slice(1);


  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <SEO
        title={`Genre: ${capitalizedGenre}`}
        description={`Daftar komik untuk genre ${capitalizedGenre}.`}
      />
      <h1 className="font-display text-4xl font-bold mb-8">
        Genre: {capitalizedGenre}
      </h1>

      {seriesList && seriesList.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {seriesList.map((manhwa) => (
            <ManhwaCard
              key={manhwa.slug}
              id={manhwa.slug}
              imageSrc={manhwa.image}
              title={manhwa.title}
              latestChapter={manhwa.latestChapter}
              rating={manhwa.rating}
            />
          ))}
        </div>
      ) : (
        <p>Tidak ada komik yang ditemukan untuk genre ini.</p>
      )}
    </div>
  );
}
