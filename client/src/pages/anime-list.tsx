import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { api } from "@/lib/api";
import { ManhwaCardSkeleton } from "@/components/manhwa-card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";
import { AnimeCard } from "@/components/anime-card";

const listDetails: Record<string, { title: string; fetcher: (page: number) => Promise<any> }> = {
  ongoing: {
    title: "Ongoing Anime",
    fetcher: api.getAnimeOngoing,
  },
  finished: {
    title: "Finished Anime",
    fetcher: api.getAnimeFinished,
  },
  movie: {
    title: "Anime Movies",
    fetcher: api.getAnimeMovie,
  },
};

export default function AnimeList() {
  const [_, params] = useRoute("/anime/list/:type/:page");
  const type = params?.type || "ongoing";
  const page = parseInt(params?.page || "1", 10);

  const { title, fetcher } = listDetails[type] || listDetails.ongoing;

  const { data, isLoading } = useQuery({
    queryKey: ["anime-list", type, page],
    queryFn: () => fetcher(page),
  });

  const animeList = data?.animes;
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen container mx-auto max-w-7xl px-4">
      <SEO title={title} description={`Daftar ${title}`} />

      <h1 className="font-display text-4xl font-bold my-8">{title}</h1>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 18 }).map((_, i) => <ManhwaCardSkeleton key={i} />)
          : animeList?.map((anime: any) => (
              <AnimeCard
                key={anime.slug}
                id={anime.id}
                slug={anime.slug}
                title={anime.title}
                imageSrc={anime.poster}
                episode={anime.score}
              />
            ))}
      </div>

      <div className="flex justify-center items-center gap-4 my-8">
        {pagination?.hasPrev && (
          <Link href={`/anime/list/${type}/${page - 1}`}>
            <Button variant="outline">Previous</Button>
          </Link>
        )}
        <span className="font-semibold">{`Page ${page}`}</span>
        {pagination?.hasNext && (
          <Link href={`/anime/list/${type}/${page + 1}`}>
            <Button variant="outline">Next</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
