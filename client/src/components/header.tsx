import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, BookOpen, Moon, Sun, Menu, X, Heart, History, LogOut, LogIn, User as UserIcon, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/firebaseConfig";
import { signOut } from "firebase/auth";
import { getSearchHistory, addSearchHistory, removeSearchHistory } from "@/lib/search-history";

export function Header() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      addSearchHistory(trimmedQuery);
      navigate(`/search/${encodeURIComponent(trimmedQuery)}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
      setIsSearchFocused(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between gap-4 px-4">
          {/* Logo */}
          <Link
            href="/"
            data-testid="link-home"
            className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-lg px-3 py-2 transition-all"
          >
            <img src="/images/header-logo.png" alt="COMIC KU" className="h-8" />
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari manhwa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setSearchHistory(getSearchHistory());
                    setIsSearchFocused(true);
                  }}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="w-full rounded-full pl-9 pr-4"
                  data-testid="input-search"
                />
              </div>
            </form>
            {isSearchFocused && searchHistory.length > 0 && (
              <div className="absolute top-12 w-full bg-background border border-border rounded-md shadow-lg z-50" data-testid="search-history-dropdown">
                <div className="p-2">
                  <h4 className="text-sm font-semibold text-muted-foreground px-2 pb-1">Riwayat Pencarian</h4>
                  {searchHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 hover:bg-accent rounded-md text-sm cursor-pointer"
                      onClick={() => {
                        setSearchQuery(item);
                        handleSearch({ preventDefault: () => {} } as React.FormEvent);
                      }}
                    >
                      <span>{item}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSearchHistory(item);
                          setSearchHistory(getSearchHistory());
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <Link href="/az-list/a" data-testid="link-az-list">
              <Button variant="ghost" className="hover-elevate active-elevate-2">
                A-Z
              </Button>
            </Link>
            <Link href="/genres" data-testid="link-genres">
              <Button variant="ghost" className="hover-elevate active-elevate-2">
                Genre
              </Button>
            </Link>
            <Link href="/room-chat" data-testid="link-room-chat">
              <Button variant="ghost" className="hover-elevate active-elevate-2">
                Room Chat
              </Button>
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/favorites')}>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Favorit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/history')}>
                    <History className="mr-2 h-4 w-4" />
                    <span>Riwayat</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" data-testid="link-login">
                <Button className="hover-elevate active-elevate-2">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover-elevate active-elevate-2"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover-elevate active-elevate-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-menu-toggle"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-background p-4 md:hidden">
            <div className="relative mb-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Cari manhwa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      setSearchHistory(getSearchHistory());
                      setIsSearchFocused(true);
                    }}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    className="w-full rounded-full pl-9"
                    data-testid="input-search-mobile"
                  />
                </div>
              </form>
              {isSearchFocused && searchHistory.length > 0 && (
                <div className="absolute top-12 w-full bg-background border border-border rounded-md shadow-lg z-50" data-testid="search-history-dropdown-mobile">
                  <div className="p-2">
                    <h4 className="text-sm font-semibold text-muted-foreground px-2 pb-1">Riwayat Pencarian</h4>
                    {searchHistory.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 hover:bg-accent rounded-md text-sm cursor-pointer"
                        onClick={() => {
                          setSearchQuery(item);
                          handleSearch({ preventDefault: () => {} } as React.FormEvent);
                        }}
                      >
                        <span>{item}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSearchHistory(item);
                            setSearchHistory(getSearchHistory());
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/az-list/a" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground min-h-8 px-3 py-2 w-full hover-elevate active-elevate-2">
                <BookOpen className="mr-2 h-5 w-5" /> Daftar A-Z
              </Link>
              <Link href="/genres" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground min-h-8 px-3 py-2 w-full hover-elevate active-elevate-2">
                <BookOpen className="mr-2 h-5 w-5" /> Genre
              </Link>
              <Link href="/room-chat" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground min-h-8 px-3 py-2 w-full hover-elevate active-elevate-2">
                <MessageSquare className="mr-2 h-5 w-5" /> Room Chat
              </Link>
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground min-h-8 px-3 py-2 w-full hover-elevate active-elevate-2">
                    <UserIcon className="mr-2 h-5 w-5" /> Profil
                  </Link>
                  <Link href="/favorites" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground min-h-8 px-3 py-2 w-full hover-elevate active-elevate-2">
                    <Heart className="mr-2 h-5 w-5" /> Favorit
                  </Link>
                  <Link href="/history" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground min-h-8 px-3 py-2 w-full hover-elevate active-elevate-2">
                    <History className="mr-2 h-5 w-5" /> Riwayat
                  </Link>
                </>
              ) : null}
              <Button
                variant="ghost"
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="justify-start hover-elevate active-elevate-2"
                data-testid="button-theme-toggle-mobile"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="mr-2 h-5 w-5" /> Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-5 w-5" /> Dark Mode
                  </>
                )}
              </Button>
              {user ? (
                <Button variant="ghost" onClick={handleLogout} className="justify-start hover-elevate active-elevate-2 text-red-500 hover:text-red-600">
                  <LogOut className="mr-2 h-5 w-5" /> Logout
                </Button>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 min-h-8 px-3 py-2 w-full hover-elevate active-elevate-2">
                  <LogIn className="mr-2 h-5 w-5" /> Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
