import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ManhwaCardSkeleton } from "@/components/manhwa-card";
import { SEO } from "@/components/seo";
import { AnimeCard } from "@/components/anime-card";

export default function AnimeSearch() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const q = searchParams.get("q") || "";

  const [query, setQuery] = useState(q);
  const [searchTerm, setSearchTerm] = useState(q);

  useEffect(() => {
    setQuery(q);
    setSearchTerm(q);
  }, [q]);

  const { data, isLoading } = useQuery({
    queryKey: ["anime-search", searchTerm],
    queryFn: () => api.searchAnime(searchTerm),
    enabled: !!searchTerm,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
  };

  const results = data?.results;

  return (
    <div className="min-h-screen container mx-auto max-w-7xl px-4">
      <SEO title="Cari Anime" description="Cari anime favoritmu." />

      <form onSubmit={handleSearch} className="flex gap-2 my-8">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari anime..."
          className="w-full"
        />
        <Button type="submit">Cari</Button>
      </form>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => <ManhwaCardSkeleton key={i} />)
          : results?.map((anime) => (
              <AnimeCard
                key={anime.slug}
                id={anime.id}
                slug={anime.slug}
                title={anime.title}
                imageSrc={anime.image}
                rating={anime.rating}
              />
            ))}
      </div>
    </div>
  );
}
