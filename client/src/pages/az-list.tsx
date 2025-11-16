import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { api } from "@/lib/api";
import { ManhwaCard, ManhwaCardSkeleton } from "@/components/manhwa-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { SEO } from "@/components/seo";
import { useState, useEffect } from "react";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function AzListPage() {
  const [, params] = useRoute("/az-list/:letter");
  const letter = params?.letter || "a";
  const [page, setPage] = useState(1);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["manhwa-az-list", letter, page],
    queryFn: () => api.getManhwaByAz(letter, page),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page, letter]);

  // Explicitly handle error state
  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h2>
        <p className="text-muted-foreground">Gagal memuat daftar manhwa.</p>
        <p className="text-sm text-red-500 mt-4">Error: {error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Render header even during loading */}
        <h1 className="font-display text-4xl font-bold mb-8">Daftar A-Z</h1>
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {alphabet.map((char) => (
            <Link key={char} href={`/az-list/${char.toLowerCase()}`}>
              <Button variant={letter.toUpperCase() === char ? "default" : "outline"}>
                {char}
              </Button>
            </Link>
          ))}
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => <ManhwaCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  // Handle case where data is undefined for some reason after loading
  if (!data) {
     return (
      <div className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Data Tidak Ditemukan</h2>
        <p className="text-muted-foreground">Tidak dapat mengambil data manhwa.</p>
      </div>
    );
  }

  const manhwaList = data.results;
  const pagination = data.pagination;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <SEO title={`Daftar A-Z: ${letter.toUpperCase()}`} description={`Jelajahi manhwa berdasarkan abjad.`} />
      <h1 className="font-display text-4xl font-bold mb-8">Daftar A-Z</h1>

      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {alphabet.map((char) => (
          <Link key={char} href={`/az-list/${char.toLowerCase()}`}>
            <Button variant={letter.toUpperCase() === char ? "default" : "outline"}>
              {char}
            </Button>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {manhwaList.map((manhwa) => (
          <ManhwaCard
            key={manhwa.slug}
            id={manhwa.slug}
            title={manhwa.title}
            imageSrc={manhwa.imageSrc}
            image={manhwa.imageSrc} // Fallback for components expecting 'image'
            rating={manhwa.rating}
            latestChapter={manhwa.latestChapter}
            chapter={manhwa.chapter}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-4 mt-12">
        <Button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1 || isFetching}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Sebelumnya
        </Button>
        <span className="font-semibold">Halaman {page}</span>
        <Button onClick={() => setPage(p => p + 1)} disabled={!pagination?.hasNextPage || isFetching}>
          Selanjutnya
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
