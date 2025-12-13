import { Switch, Route, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BottomNavbar } from "@/components/bottom-navbar";
import { FloatingNotification } from "@/components/floating-notification";
import SecurityCheck from "@/components/security-check";
import { useState, useEffect } from "react";
import { doc, setDoc, increment, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

// Pages
import Home from "@/pages/home";
import SearchPage from "@/pages/search";
import ManhwaDetail from "@/pages/manhwa-detail";
import ChapterReader from "@/pages/chapter-reader";
import ManhwaListPage from "@/pages/manhwa-list";
import AzListPage from "@/pages/az-list";
import GenreListPage from "@/pages/genre-list";
import GenreDetailPage from "@/pages/genre-detail";
import AuthPage from "@/pages/auth";
import HistoryPage from "@/pages/history";
import ProfilePage from "@/pages/profile";
import SupportPage from "@/pages/support";
import AdminPage from "@/pages/admin";
import LeaderboardPage from "@/pages/leaderboard";
import RoomChat from "@/pages/RoomChat";
import PrivateChat from "@/pages/PrivateChat";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/components/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin">
        <ProtectedRoute component={AdminPage} />
      </Route>
      <Route path="/list/:type" component={ManhwaListPage} />
      <Route path="/az-list/:letter" component={AzListPage} />
      <Route path="/genres" component={GenreListPage} />
      <Route path="/genre/:name" component={GenreDetailPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/register" component={AuthPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/user/:uid" component={ProfilePage} />
      <Route path="/support" component={SupportPage} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route path="/room-chat" component={RoomChat} />
      <Route path="/messages" component={PrivateChat} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/search/:query" component={SearchPage} />
      <Route path="/manhwa/:id" component={ManhwaDetail} />
      <Route path="/chapter/:id" component={ChapterReader} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { AuthProvider } from "@/hooks/use-auth";
import { usePresence } from "@/hooks/use-presence";
import { useAuth } from "@/hooks/use-auth";
import { checkDailyStreak } from "@/lib/daily-streak";

function App() {
  // Track visits once per session/mount
  useEffect(() => {
    const trackVisit = async () => {
      // Check session storage to avoid double counting on reload (optional, but requested "activity user yang buka web")
      // Usually "visits" implies session starts.
      const hasVisited = sessionStorage.getItem("visit_tracked");
      if (!hasVisited) {
        try {
          const statsRef = doc(db, "site_stats", "general");
          // Use updateDoc if exists, setDoc with merge if potentially new
          // Simpler: Try update, catch if fail (doc missing), then set.
          // Or just set with merge: true (though increment needs special handling on init)

          // Best safe approach: getDoc first
          const docSnap = await getDoc(statsRef);

          if (docSnap.exists()) {
             await updateDoc(statsRef, {
                visits: increment(1)
             });
          } else {
             await setDoc(statsRef, {
                visits: 1
             });
          }
          sessionStorage.setItem("visit_tracked", "true");
        } catch (error) {
           console.error("Failed to track visit:", error);
        }
      }
    };
    trackVisit();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="manhwaku-theme">
        <AuthProvider>
          <TooltipProvider>
            <AppLayout />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppLayout() {
  const [isChapterReader] = useRoute("/chapter/:id");
  const [isChatPage] = useRoute("/room-chat");
  const [isPrivateChat] = useRoute("/messages");
  const [isVerified, setIsVerified] = useState(false);
  const { user } = useAuth();

  // Check session storage on mount
  useEffect(() => {
    const verified = sessionStorage.getItem("turnstile_verified");
    if (verified === "true") {
      setIsVerified(true);
    }
  }, []);

  // Check Daily Streak moved to Support Page (manual claim) as requested
  // "nanti bisa cek check in harian atau streak nya jadi bisa claim manual"

  const handleVerification = () => {
    sessionStorage.setItem("turnstile_verified", "true");
    setIsVerified(true);
  };

  // Activate presence tracking only if verified (optional, but good practice)
  usePresence();

  const showHeader = !isChapterReader && !isChatPage && !isPrivateChat;
  const showFooter = !isChapterReader && !isChatPage && !isPrivateChat;
  const mainPadding = !isChapterReader && !isChatPage && !isPrivateChat ? "pb-16 md:pb-0" : "";

  if (!isVerified) {
    return (
      <div className="flex flex-col min-h-screen">
        <SecurityCheck onVerify={handleVerification} />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {showHeader && <Header />}
      <main className={`flex-1 ${mainPadding}`}>
        <Router />
      </main>
      {showFooter && <Footer />}
      {showFooter && <BottomNavbar />}
      <FloatingNotification />
    </div>
  );
}

export default App;
