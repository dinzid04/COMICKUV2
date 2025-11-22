import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { api } from "@/lib/api";
import { SEO } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2 } from "lucide-react";

const AnimeDetailPage: React.FC = () => {
  const { id, slug } = useParams<{ id: string; slug: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["anime/detail", id, slug],
    queryFn: () => api.getAnimeDetail(id!, slug!),
    enabled: !!id && !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (error || !data?.results) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Gagal Memuat Detail Anime</h2>
        <p className="text-muted-foreground">
          Terjadi kesalahan saat mengambil data. Silakan coba lagi nanti.
        </p>
      </div>
    );
  }

  const anime = data.results;

  return (
    <div>
      <SEO
        title={anime.title}
        description={anime.description.substring(0, 160)}
        imageUrl={anime.image}
      />

      {/* Banner */}
      <div className="relative h-64 md:h-80 w-full">
        <img src={anime.image} alt={anime.title} className="w-full h-full object-cover blur-md" />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 pb-12 -mt-32">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <img src={anime.image} alt={anime.title} className="rounded-lg shadow-xl w-full" />
            <Link href={`/anime/watch/${id}/${slug}/1`}>
                <Button className="w-full mt-4">Tonton Sekarang</Button>
            </Link>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4 text-white">
            <h1 className="text-4xl font-bold mb-2">{anime.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {anime.details.find(d => d.type === "Genre:")?.data?.split(', ').map(genre => (
                <Badge key={genre} variant="secondary">{genre}</Badge>
              ))}
            </div>

            <p className="text-gray-300 mb-6" dangerouslySetInnerHTML={{ __html: anime.description }} />

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 mb-8 bg-black/30 p-4 rounded-lg">
              {anime.details.map((detail, index) => detail.data && (
                <div key={index}>
                  <p className="font-semibold text-gray-400">{detail.type}</p>
                  <p>{detail.data}</p>
                </div>
              ))}
            </div>

            {/* Episode List */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Daftar Episode</h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {anime.episode.map((ep) => (
                  <Link key={ep} href={`/anime/watch/${id}/${slug}/${ep}`}>
                    <Button variant="outline" className="w-full">
                      Eps {ep}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailPage;
