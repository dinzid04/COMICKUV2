import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { SEO } from "@/components/seo";

export default function GenreListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["genres"],
    queryFn: api.getGenres,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Memuat genre...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h2>
        <p className="text-muted-foreground">Gagal memuat daftar genre.</p>
      </div>
    );
  }

  const genres = data.genres;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <SEO title="Daftar Genre" description="Jelajahi manhwa berdasarkan genre." />
      <h1 className="font-display text-4xl font-bold mb-8">Daftar Genre</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {genres.map((genre) => (
          <Link key={genre.value} href={`/genre/${genre.label.toLowerCase()}`}>
            <Button variant="outline" className="w-full justify-start text-lg py-6">
              {genre.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
