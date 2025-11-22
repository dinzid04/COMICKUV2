import React from "react";
import { Link } from "wouter";
import { Star } from "lucide-react";

interface AnimeCardProps {
  id: string;
  slug: string;
  title: string;
  image: string;
  score: string | null;
  type?: string;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ id, slug, title, image, score, type }) => {
  return (
    <Link href={`/anime/detail/${id}/${slug}`}>
      <div className="group relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <img
          src={image}
          alt={title}
          className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="truncate text-lg font-bold group-hover:text-primary">{title}</h3>
          <div className="flex items-center justify-between text-sm">
            {type && <span>{type}</span>}
            {score && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>{score}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;
