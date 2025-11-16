import { Switch, Route, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BottomNavbar } from "@/components/bottom-navbar";

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
import AdminPage from "@/pages/admin";
import LeaderboardPage from "@/pages/leaderboard";
import RoomChat from "@/pages/RoomChat";
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
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route path="/room-chat" component={RoomChat} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/search/:query" component={SearchPage} />
      <Route path="/manhwa/:id" component={ManhwaDetail} />
      <Route path="/chapter/:id" component={ChapterReader} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { AuthProvider } from "@/hooks/use-auth";

function App() {
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

  const showHeader = !isChapterReader && !isChatPage;
  const showFooter = !isChapterReader && !isChatPage;
  const mainPadding = !isChapterReader && !isChatPage ? "pb-16 md:pb-0" : "";


  return (
    <div className="flex flex-col min-h-screen">
      {showHeader && <Header />}
      <main className={`flex-1 ${mainPadding}`}>
        <Router />
      </main>
      {showFooter && <Footer />}
      {showFooter && <BottomNavbar />}
    </div>
  );
}

export default App;
