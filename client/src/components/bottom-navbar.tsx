import { Link, useRoute } from "wouter";
import { Home, History, User, Trophy, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadMessages } from "@/hooks/use-unread-messages";

export function BottomNavbar() {
  const { user } = useAuth();
  const [isHomeActive] = useRoute("/");
  const [isHistoryActive] = useRoute("/history");
  const [isLeaderboardActive] = useRoute("/leaderboard");
  const [isProfileActive] = useRoute("/profile");
  const [isMessagesActive] = useRoute("/messages");

  // Unread count
  const unreadCount = useUnreadMessages();

  const profileLink = user ? "/profile" : "/login";

  return (
    <nav className="fixed bottom-0 z-50 w-full border-t border-border bg-background/80 backdrop-blur-xl md:hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-5 h-16">
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
            href="/messages"
            className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
              isMessagesActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className="relative">
                <MessageSquare className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 flex items-center justify-center text-[8px] font-bold text-white">
                        {unreadCount > 9 ? '' : unreadCount}
                    </span>
                )}
            </div>
            <span className="text-xs">Pesan</span>
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
            href="/leaderboard"
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isLeaderboardActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Trophy className="h-5 w-5" />
            <span className="text-xs">Rank</span>
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
