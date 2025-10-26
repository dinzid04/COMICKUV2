import { useRoute } from "wouter";
import { Tag } from "lucide-react";
import { SEO } from "@/components/seo";

export default function GenreDetail() {
  const [, params] = useRoute("/genre/:id");
  const genreId = params?.id || "";
  const genreName = decodeURIComponent(genreId).replace(/-/g, " ");

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <SEO
        title={`Genre ${genreName}`}
        description={`Jelajahi komik dengan genre ${genreName}. Baca gratis di COMIC KU.`}
      />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Tag className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl font-bold capitalize">{genreName}</h1>
        </div>
        <p className="text-muted-foreground">
          Jelajahi manhwa dengan genre {genreName}
        </p>
      </div>

      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">
          Fitur genre detail akan segera hadir
        </p>
        <p className="text-sm text-muted-foreground">
          Gunakan search untuk mencari manhwa berdasarkan genre
        </p>
      </div>
    </div>
  );
}
