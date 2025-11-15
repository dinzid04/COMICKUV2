import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { api } from "@/lib/api";
import { ManhwaCard, ManhwaCardSkeleton } from "@/components/manhwa-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { SEO } from "@/components/seo";
import { useState, useEffect } from "react";

type ListType = "new" | "popular" | "ongoing" | "manga" | "comic" | "manhua";

const listDetails: Record<ListType, { title: string; fn: (page: number) => ReturnType<typeof api.getManhwaNew> }> = {
  new: { title: "Manhwa Terbaru", fn: api.getManhwaNew },
  popular: { title: "Manhwa Populer", fn: api.getManhwaPopular },
  ongoing: { title: "Manhwa Ongoing", fn: api.getManhwaOngoing },
  manga: { title: "Manga", fn: api.getManhwaManga },
  comic: { title: "Comic", fn: api.getManhwaComic },
  manhua: { title: "Manhua", fn: api.getManhwaManhua },
};

export default function ManhwaListPage() {
  const [, params] = useRoute("/list/:type");
  const type = params?.type as ListType;
  const [page, setPage] = useState(1);

  const { title, fn } = listDetails[type] || { title: "Daftar Manhwa", fn: api.getManhwaNew };

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["manhwa-list", type, page],
    queryFn: () => fn(page),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => <ManhwaCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
     return (
      <div className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h2>
        <p className="text-muted-foreground">Gagal memuat daftar manhwa.</p>
      </div>
    );
  }

  const manhwaList = data.results;
  const pagination = data.pagination;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <SEO title={title} description={`Jelajahi ${title.toLowerCase()} terbaru dan terpopuler.`} />
      <h1 className="font-display text-4xl font-bold mb-8">{title}</h1>

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
        <Button onClick={() => setPage(p => p + 1)} disabled={isFetching}>
          Selanjutnya
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}