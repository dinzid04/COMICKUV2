import { Link, useRoute } from "wouter";
import { Home, Heart, History, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function BottomNavbar() {
  const { user } = useAuth();
  const [isHomeActive] = useRoute("/");
  const [isFavoritesActive] = useRoute("/favorites");
  const [isHistoryActive] = useRoute("/history");
  const [isProfileActive] = useRoute("/profile");

  const profileLink = user ? "/profile" : "/login";

  return (
    <nav className="fixed bottom-0 z-50 w-full border-t border-border bg-background/80 backdrop-blur-xl md:hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-4 h-16">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isHomeActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Beranda</span>
          </Link>
          <Link
            href="/favorites"
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isFavoritesActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Heart className="h-5 w-5" />
            <span className="text-xs">Favorit</span>
          </Link>
          <Link
            href="/history"
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isHistoryActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <History className="h-5 w-5" />
            <span className="text-xs">Riwayat</span>
          </Link>
          <Link
            href={profileLink}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isProfileActive ? "text-primary" : "text-muted-foreground"
              }`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">{user ? "Akun" : "Login"}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
