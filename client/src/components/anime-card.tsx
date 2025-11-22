import { Link } from "wouter";

interface AnimeCardProps {
  id: string;
  slug: string;
  title: string;
  imageSrc: string;
  episode?: string | null;
  rating?: string | null;
}

export function AnimeCard({ id, slug, title, imageSrc, episode, rating }: AnimeCardProps) {
  return (
    <Link href={`/anime/detail/${id}/${slug}`}>
      <div className="group cursor-pointer">
        <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted">
          <img src={imageSrc} alt={title} className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105" />
        </div>
        <h3 className="mt-2 text-sm font-semibold text-foreground truncate">{title}</h3>
        {episode && <p className="text-xs text-muted-foreground">{`Ep ${episode}`}</p>}
        {rating && <p className="text-xs text-muted-foreground">{`Rating: ${rating}`}</p>}
      </div>
    </Link>
  );
}
