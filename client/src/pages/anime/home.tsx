import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import AnimeCard from "@/components/anime/AnimeCard";
import { ManhwaCardSkeleton } from "@/components/manhwa-card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";
import { Anime } from "@shared/anime-types";

const AnimeHome: React.FC = () => {
  const { data: homeData, isLoading: isLoadingHome } = useQuery({
    queryKey: ["anime/home"],
    queryFn: api.getAnimeHome,
  });

  return (
    <div>
      <SEO
        title="Nonton Anime Sub Indo"
        description="Streaming anime subtitle Indonesia gratis. Koleksi anime terbaru dan terpopuler."
      />

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Ongoing Anime Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Sedang Tayang</h2>
            <Link href="/anime/list/ongoing">
              <Button variant="outline">Lihat Semua</Button>
            </Link>
          </div>
          {isLoadingHome ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <ManhwaCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {homeData?.ongoing.slice(0, 12).map((anime) => (
                <AnimeCard
                  key={anime.id}
                  id={anime.id}
                  slug={anime.slug}
                  title={anime.title}
                  image={anime.image}
                  score={`Ep ${anime.episode}`}
                  type={anime.type}
                />
              ))}
            </div>
          )}
        </div>

        {/* Completed Anime Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Selesai</h2>
            <Link href="/anime/list/finished">
              <Button variant="outline">Lihat Semua</Button>
            </Link>
          </div>
          {isLoadingHome ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <ManhwaCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {homeData?.completed.slice(0, 12).map((anime) => (
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
        </div>
      </div>
    </div>
  );
};

export default AnimeHome;
