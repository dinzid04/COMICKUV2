import { Link } from "wouter";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="font-display text-9xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-bold mb-2">Halaman Tidak Ditemukan</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Maaf, halaman yang kamu cari tidak dapat ditemukan. Halaman mungkin telah dipindahkan atau dihapus.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/">
            <a>
              <Button className="gap-2" data-testid="button-home-404">
                <Home className="h-4 w-4" />
                Kembali ke Home
              </Button>
            </a>
          </Link>
          <Link href="/genres">
            <a>
              <Button variant="outline" className="gap-2" data-testid="button-genres-404">
                <Search className="h-4 w-4" />
                Jelajahi Genre
              </Button>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
