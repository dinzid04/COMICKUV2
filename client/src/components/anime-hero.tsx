import { Link } from "wouter";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Anime } from "shared/anime-types";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export function AnimeHero({ animes }: { animes: Anime[] }) {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()]);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {animes.map((anime) => (
          <div key={anime.slug} className="flex-[0_0_100%] relative">
            <img
              src={anime.image}
              alt={anime.title}
              className="w-full h-[400px] md:h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
                {anime.title}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold">{anime.score}</span>
              </div>
              <Link href={`/anime/detail/${anime.id}/${anime.slug}`}>
                <Button size="lg">Details</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
