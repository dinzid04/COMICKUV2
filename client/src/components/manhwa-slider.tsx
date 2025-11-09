import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractManhwaId } from "@/lib/api";
import type { ManhwaListItem } from "@shared/types";

interface ManhwaSliderProps {
  manhwaList: ManhwaListItem[];
}

export function ManhwaSlider({ manhwaList }: ManhwaSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayList = manhwaList.slice(0, 8);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayList.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [displayList.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + displayList.length) % displayList.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayList.length);
  };

  if (displayList.length === 0) return null;

  const currentManhwa = displayList[currentIndex];
  const manhwaId = extractManhwaId(currentManhwa.slug);

  return (
    <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-lg">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={currentManhwa.imageSrc}
          alt={currentManhwa.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto max-w-7xl px-4 flex items-end pb-12">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
            {currentManhwa.title}
          </h2>

          {currentManhwa.rating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold text-white">{currentManhwa.rating}</span>
              </div>
              {currentManhwa.chapter && (
                <div className="text-sm text-white/80 bg-background/40 backdrop-blur-sm px-3 py-1 rounded-full">
                  {currentManhwa.chapter}
                </div>
              )}
            </div>
          )}

          <Link 
            href={`/manhwa/${manhwaId}`} 
            data-testid={`link-slider-${manhwaId}`}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 min-h-10 px-8 hover-elevate active-elevate-2"
          >
            <Play className="h-5 w-5" />
            Baca Sekarang
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/40 backdrop-blur-sm hover-elevate active-elevate-2 transition-all"
        data-testid="button-slider-prev"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/40 backdrop-blur-sm hover-elevate active-elevate-2 transition-all"
        data-testid="button-slider-next"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {displayList.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? "w-8 bg-primary" : "w-2 bg-white/50"
            }`}
            data-testid={`button-slider-dot-${index}`}
          />
        ))}
      </div>
    </div>
  );
}
