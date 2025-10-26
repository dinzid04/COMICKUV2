import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { Flame, TrendingUp, Clock } from "lucide-react";
import { api, extractManhwaId } from "@/lib/api";
import { db } from "@/firebaseConfig";
import { ManhwaSlider } from "@/components/manhwa-slider";
import { ManhwaCard, ManhwaCardSkeleton } from "@/components/manhwa-card";
import { SEO } from "@/components/seo";

// Tipe data untuk quote section
interface QuoteSectionData {
  quote: string;
  author: string;
  authorImageUrl: string;
}

// Fungsi untuk mengambil data dari Firestore
const fetchQuoteSectionData = async (): Promise<QuoteSectionData | null> => {
  // Jika db null (Firebase tidak terkonfigurasi), jangan lakukan apa-apa.
  if (!db) return null;
  const docRef = doc(db, "dashboard", "settings");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists() && docSnap.data()?.quoteSection) {
    return docSnap.data().quoteSection as QuoteSectionData;
  }
  return null;
};

export default function Home() {
  // Default data for the quote section
  const defaultQuoteData: QuoteSectionData = {
    quote: "Persahabatan itu adalah tempat saling berbagi rasa sakit.",
    author: "Yoimiya",
    authorImageUrl: "https://cdn.nefyu.my.id/030i.jpeg",
  };

  // Query untuk mengambil data quote
  const { data: fetchedQuoteData } = useQuery({
    queryKey: ["quoteSection"],
    queryFn: fetchQuoteSectionData,
    staleTime: 300000, // 5 menit
  });

  // Gunakan data yang diambil atau data default jika tidak ada
  const quoteData = fetchedQuoteData || defaultQuoteData;

  const { data: recommendations, isLoading: loadingRec } = useQuery({
    queryKey: ["/api/manhwa-recommendation"],
    queryFn: api.getManhwaRecommendation,
  });

  const { data: newManhwa, isLoading: loadingNew } = useQuery({
    queryKey: ["/api/manhwa-new"],
    queryFn: api.getManhwaNew,
  });

  const { data: popularManhwa, isLoading: loadingPopular } = useQuery({
    queryKey: ["/api/manhwa-popular"],
    queryFn: api.getManhwaPopular,
  });

  const { data: topManhwa, isLoading: loadingTop } = useQuery({
    queryKey: ["/api/manhwa-top"],
    queryFn: api.getManhwaTop,
  });

  return (
    <div className="min-h-screen">
      <SEO
        title="Beranda - Baca Manhwa Gratis"
        description="Baca manhwa terbaru, populer, dan top rated gratis online. Nikmati koleksi lengkap manhwa berkualitas tinggi dengan update terbaru setiap hari."
      />

      {/* Hero Slider */}
      <section className="mb-8">
        {loadingRec ? (
          <div className="h-[400px] md:h-[500px] rounded-lg bg-muted animate-pulse" />
        ) : recommendations && recommendations.length > 0 ? (
          <ManhwaSlider manhwaList={recommendations} />
        ) : null}
      </section>

      {/* Quote Section Implementation */}
      <div className="container mx-auto max-w-7xl px-4">
        <section className="mb-12">
            <div className="bg-card text-card-foreground rounded-lg p-4 flex items-center gap-4 shadow-md">
                <img
                    src={quoteData.authorImageUrl}
                    alt={quoteData.author}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                />
                <div className="flex-1">
                    <p className="italic text-foreground font-medium">
                        "{quoteData.quote}"
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 text-right w-full">
                        - {quoteData.author}
                    </p>
                </div>
            </div>
        </section>
    </div>

      <div className="container mx-auto max-w-7xl px-4 space-y-16">
        {/* Terbaru Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              <h2 className="font-display text-3xl font-bold">Terbaru</h2>
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loadingNew
              ? Array.from({ length: 12 }).map((_, i) => <ManhwaCardSkeleton key={i} />)
              : newManhwa?.slice(0, 12).map((manhwa) => (
                  <ManhwaCard
                    key={manhwa.link}
                    id={extractManhwaId(manhwa.link)}
                    title={manhwa.title}
                    image={manhwa.imageSrc || manhwa.imageUrl || ""}
                    chapter={manhwa.chapters?.[0]?.chapterTitle}
                  />
                ))}
          </div>
        </section>

        {/* Populer Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Flame className="h-6 w-6 text-primary" />
              <h2 className="font-display text-3xl font-bold">Populer</h2>
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loadingPopular
              ? Array.from({ length: 12 }).map((_, i) => <ManhwaCardSkeleton key={i} />)
              // ... sisa kode tidak berubah
              : popularManhwa?.slice(0, 12).map((manhwa) => (
                  <ManhwaCard
                    key={manhwa.link}
                    id={extractManhwaId(manhwa.link)}
                    title={manhwa.title}
                    image={manhwa.imageSrc || manhwa.imageUrl || ""}
                    rating={manhwa.rating}
                    chapter={manhwa.chapter}
                  />
                ))}
          </div>
        </section>

        {/* Top Rated Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="font-display text-3xl font-bold">Top Rated</h2>
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loadingTop
              ? Array.from({ length: 12 }).map((_, i) => <ManhwaCardSkeleton key={i} />)
              : topManhwa?.slice(0, 12).map((manhwa) => (
                  <ManhwaCard
                    key={manhwa.url}
                    id={extractManhwaId(manhwa.url)}
                    title={manhwa.title}
                    image={manhwa.image}
                    rating={manhwa.rating}
                  />
                ))}
          </div>
        </section>
      </div>
    </div>
  );
}
