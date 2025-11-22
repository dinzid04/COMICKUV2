import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";

export default function AnimeDetail() {
  const [_, params] = useRoute("/anime/detail/:id/:slug");
  const id = params?.id || "";
  const slug = params?.slug || "";

  const { data, isLoading } = useQuery({
    queryKey: ["anime-detail", id, slug],
    queryFn: () => api.getAnimeDetail(id, slug),
  });

  const anime = data?.results;

  return (
    <div className="min-h-screen container mx-auto max-w-7xl px-4">
      <SEO title={anime?.title} description={anime?.description} />

      {isLoading ? (
        <div className="flex flex-col md:flex-row gap-8 my-8">
          <div className="w-full md:w-1/4 h-96 bg-muted rounded-lg animate-pulse" />
          <div className="w-full md:w-3/4 space-y-4">
            <div className="h-10 bg-muted rounded-lg animate-pulse w-1/2" />
            <div className="h-4 bg-muted rounded-lg animate-pulse" />
            <div className="h-4 bg-muted rounded-lg animate-pulse" />
            <div className="h-4 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      ) : anime ? (
        <div className="flex flex-col md:flex-row gap-8 my-8">
          <img src={anime.image} alt={anime.title} className="w-full md:w-1/4 h-auto object-cover rounded-lg" />
          <div className="w-full md:w-3/4">
            <h1 className="font-display text-4xl font-bold">{anime.title}</h1>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {anime.details.map((detail) => (
                <div key={detail.type} className="text-sm">
                  <span className="font-semibold">{detail.type}</span>
                  <span className="text-muted-foreground">{detail.data}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-muted-foreground" dangerouslySetInnerHTML={{ __html: anime.description }} />

            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Episodes</h2>
              <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-2">
                {anime.episode.map((ep) => (
                  <Link key={ep} href={`/anime/stream/${id}/${slug}/${ep}`}>
                    <Button variant="outline" className="w-full">{`Eps ${ep}`}</Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>Anime not found.</p>
      )}
    </div>
  );
}
