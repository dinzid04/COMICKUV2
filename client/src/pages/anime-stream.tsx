import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { api } from "@/lib/api";
import { SEO } from "@/components/seo";

export default function AnimeStream() {
  const [_, params] = useRoute("/anime/stream/:id/:slug/:episode");
  const id = params?.id || "";
  const slug = params?.slug || "";
  const episode = params?.episode || "";

  const { data, isLoading } = useQuery({
    queryKey: ["anime-stream", id, slug, episode],
    queryFn: () => api.getAnimeStream(id, slug, episode),
  });

  const stream = data;

  return (
    <div className="min-h-screen container mx-auto max-w-7xl px-4">
      <SEO title={stream?.title} description={`Nonton ${stream?.title}`} />

      {isLoading ? (
        <div className="my-8">
          <div className="w-full h-96 bg-muted rounded-lg animate-pulse" />
          <div className="h-10 bg-muted rounded-lg animate-pulse w-1/2 mt-4" />
        </div>
      ) : stream ? (
        <div className="my-8">
          <video controls src={stream.streams[0]?.url} className="w-full rounded-lg" />
          <h1 className="font-display text-4xl font-bold mt-4">{stream.title}</h1>

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Downloads</h2>
            <div className="space-y-4">
              {stream.downloads.map((download) => (
                <div key={download.quality_group}>
                  <h3 className="font-semibold">{download.quality_group}</h3>
                  <div className="flex gap-2 mt-2">
                    {download.links.map((link) => (
                      <a
                        key={link.provider}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm"
                      >
                        {link.provider}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p>Stream not found.</p>
      )}
    </div>
  );
}
