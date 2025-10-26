import { Switch, Route } from "wouter";
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
import GenresPage from "@/pages/genres";
import GenreDetail from "@/pages/genre-detail";
import ManhwaDetail from "@/pages/manhwa-detail";
import ChapterReader from "@/pages/chapter-reader";
import AuthPage from "@/pages/auth";
import FavoritesPage from "@/pages/favorites";
import HistoryPage from "@/pages/history";
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminRoute from "@/components/admin-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin">
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      </Route>
      <Route path="/login" component={AuthPage} />
      <Route path="/register" component={AuthPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/favorites" component={FavoritesPage} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/search/:query" component={SearchPage} />
      <Route path="/genres" component={GenresPage} />
      <Route path="/genre/:id" component={GenreDetail} />
      <Route path="/manhwa/:id" component={ManhwaDetail} />
      <Route path="/chapter/:id" component={ChapterReader} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { AuthProvider } from "@/hooks/use-auth";
import { isFirebaseConfigured } from "@/firebaseConfig";

function App() {
  if (!isFirebaseConfigured) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-card text-card-foreground rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Firebase Configuration Missing
          </h1>
          <p>
            Please set up your Firebase environment variables. Create a{" "}
            <code className="bg-muted text-muted-foreground p-1 rounded">
              .env
            </code>{" "}
            file in the{" "}
            <code className="bg-muted text-muted-foreground p-1 rounded">
              client
            </code>{" "}
            directory and add your Firebase project configuration.
          </p>
          <p className="mt-4">
            You can find the required variables in the{" "}
            <code className="bg-muted text-muted-foreground p-1 rounded">
              .env.example
            </code>{" "}
            file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="manhwaku-theme">
        <AuthProvider>
          <TooltipProvider>
            <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 pb-16 md:pb-0">
              <Router />
            </main>
            <Footer />
            <BottomNavbar />
          </div>
          <Toaster />
        </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
