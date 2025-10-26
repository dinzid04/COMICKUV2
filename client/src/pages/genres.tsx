import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Tag, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";

export default function GenresPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/genres"],
    queryFn: api.getGenres,
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <SEO
        title="Genre Manhwa"
        description="Jelajahi manhwa berdasarkan genre favorit kamu. Temukan manhwa action, romance, fantasy, comedy, horror, dan masih banyak lagi."
      />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Tag className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl font-bold">Genre Manhwa</h1>
        </div>
        <p className="text-muted-foreground">
          Jelajahi manhwa berdasarkan genre favorit kamu
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : data?.genres ? (
        <div className="flex flex-wrap gap-3">
          {data.genres.map((genre) => (
            <Link
              key={genre.value}
              href={`/genre/${genre.value}`}
              data-testid={`link-genre-${genre.value}`}
            >
              <a>
                <Button
                  variant="outline"
                  className="hover-elevate active-elevate-2 transition-all"
                >
                  {genre.label}
                </Button>
              </a>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          Tidak dapat memuat genre
        </div>
      )}
    </div>
  );
}
