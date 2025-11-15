import { Play, Pause, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";

interface AutoScrollControlsProps {
  isScrolling: boolean;
  scrollSpeed: number;
  onToggleScroll: () => void;
  onSpeedChange: (speed: number) => void;
  onHide: () => void;
}

const speedOptions = [1, 1.5, 2, 2.5];

export function AutoScrollControls({
  isScrolling,
  scrollSpeed,
  onToggleScroll,
  onSpeedChange,
  onHide,
}: AutoScrollControlsProps) {
  return (
    <div className="fixed top-16 right-4 z-50 bg-background/95 p-2 rounded-lg shadow-lg border border-border flex flex-col items-center gap-2" data-testid="auto-scroll-controls">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Speed:</span>
        {speedOptions.map((speed) => (
          <Button
            key={speed}
            variant={scrollSpeed === speed ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onSpeedChange(speed)}
            className="w-10 h-8"
          >
            {speed}x
          </Button>
        ))}
      </div>
      <div className="flex w-full justify-center">
          <Button onClick={onToggleScroll} size="sm" className="w-full" data-testid="toggle-scroll-button">
            {isScrolling ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
      </div>
      <Button onClick={onHide} variant="ghost" size="sm" className="w-full mt-1" data-testid="hide-controls-button">
        <ChevronUp className="h-4 w-4" />
        <span className="ml-2">Hide</span>
      </Button>
    </div>
  );
}
