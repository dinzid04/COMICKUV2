import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import AnimeCard from "@/components/anime/AnimeCard";
import { ManhwaCardSkeleton } from "@/components/manhwa-card"; // Reusing skeleton for now
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";
import { Anime } from "@shared/anime-types";

type AnimeListType = "ongoing" | "finished" | "movie";

const listDetails = {
  ongoing: {
    title: "Anime Sedang Tayang",
    fetcher: api.getOngoingAnime,
  },
  finished: {
    title: "Anime Selesai",
    fetcher: api.getFinishedAnime,
  },
  movie: {
    title: "Film Anime",
    fetcher: api.getMovieAnime,
  },
};

const AnimeListPage: React.FC = () => {
  const { type } = useParams<{ type: AnimeListType }>();
  const [, navigate] = useLocation();
  const [listType, setListType] = useState<AnimeListType>(type || "ongoing");

  useEffect(() => {
    if (type && listDetails[type]) {
      setListType(type);
    } else {
      navigate("/anime/list/ongoing", { replace: true });
    }
  }, [type, navigate]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["anime/list", listType],
    queryFn: ({ pageParam = 1 }) => listDetails[listType].fetcher(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.currentPage + 1 : undefined,
    enabled: !!listType,
  });

  if (!listType || !listDetails[listType]) {
    return null; // or a not found component
  }

  const animes = data?.pages.flatMap((page) => page.animes) ?? [];
  const { title } = listDetails[listType];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <SEO
        title={title}
        description={`Daftar ${title}, tonton gratis di COMIC KU.`}
      />
      <h1 className="font-display text-3xl font-bold mb-8">{title}</h1>

      {error ? (
        <div className="text-center py-20">Error loading data.</div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <ManhwaCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {animes.map((anime: Anime) => (
              <AnimeCard
                key={anime.id}
                id={anime.id}
                slug={anime.slug}
                title={anime.title}
                image={anime.poster}
                score={anime.score}
                type={""} // The list API response doesn't have a 'type' field
              />
            ))}
          </div>
          {hasNextPage && (
            <div className="mt-8 text-center">
              <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? "Memuat..." : "Tampilkan Lebih Banyak"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnimeListPage;
