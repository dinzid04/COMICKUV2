import { Link } from "wouter";
import { Star, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ManhwaCardProps {
  id: string;
  title: string;
  image?: string;
  imageSrc?: string;
  rating?: string;
  chapter?: string;
  latestChapter?: string;
}

export function ManhwaCard({ id, title, image, imageSrc, rating, chapter, latestChapter }: ManhwaCardProps) {
  const displayChapter = chapter || latestChapter;
  const displayImage = image || imageSrc || "";

  return (
    <Link href={`/manhwa/${id}?image=${encodeURIComponent(displayImage)}`} data-testid={`manhwa-card-${id}`} className="group block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
          {/* Image */}
          <img
            src={displayImage}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />

          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Rating Badge */}
          {rating && (
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-sm px-2 py-1">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              <span className="text-xs font-semibold">{rating}</span>
            </div>
          )}

          {/* Chapter Info on Hover */}
          {displayChapter && (
            <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0">
              <div className="flex items-center gap-1 text-white">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">{displayChapter}</span>
              </div>
            </div>
          )}
        </div>

        {/* Title */}
      <h3 className="mt-3 font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
    </Link>
  );
}

export function ManhwaCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-lg bg-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      </div>
      <div className="mt-3 h-4 w-3/4 rounded bg-muted"></div>
      <div className="mt-2 h-3 w-1/2 rounded bg-muted"></div>
    </div>
  );
}
