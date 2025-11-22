import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { api } from "@/lib/api";
import { SEO } from "@/components/seo";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function AnimeStream() {
  const [_, params] = useRoute("/anime/stream/:id/:slug/:episode");
  const [location, navigate] = useLocation();
  const id = params?.id || "";
  const slug = params?.slug || "";
  const episode = params?.episode || "";

  const { data, isLoading } = useQuery({
    queryKey: ["anime-stream", id, slug, episode],
    queryFn: () => api.getAnimeStream(id, slug, episode),
  });

  const stream = data;
  const [selectedQuality, setSelectedQuality] = useState("720p");
  const [videoSrc, setVideoSrc] = useState("");

  useEffect(() => {
    if (stream) {
      const selectedStream = stream.streams.find((s) => s.quality === selectedQuality);
      setVideoSrc(selectedStream?.url || stream.streams[0]?.url || "");
    }
  }, [stream, selectedQuality]);

  const handleVideoEnded = () => {
    if (stream?.navigation.next) {
      navigate(`/anime/stream/${id}/${slug}/${stream.navigation.next}`);
    }
  };

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
          <video controls src={videoSrc} className="w-full rounded-lg" onEnded={handleVideoEnded} autoPlay />
          <div className="flex justify-between items-center mt-4">
            <h1 className="font-display text-4xl font-bold">{stream.title}</h1>
            <div className="flex gap-2">
              {stream.navigation.prev && (
                <Link href={`/anime/stream/${id}/${slug}/${stream.navigation.prev}`}>
                  <Button variant="outline">Prev Episode</Button>
                </Link>
              )}
              {stream.navigation.next && (
                <Link href={`/anime/stream/${id}/${slug}/${stream.navigation.next}`}>
                  <Button variant="outline">Next Episode</Button>
                </Link>
              )}
            </div>
          </div>

          <div className="mt-4">
            <Select onValueChange={setSelectedQuality} defaultValue={selectedQuality}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                {stream.streams.map((s) => (
                  <SelectItem key={s.quality} value={s.quality}>
                    {s.quality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-8">
            <Accordion type="single" collapsible>
              <AccordionItem value="downloads">
                <AccordionTrigger>
                  <h2 className="text-2xl font-bold">Downloads</h2>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {stream.downloads.map((download) => (
                      <div key={download.quality_group}>
                        <h3 className="font-semibold">{download.quality_group}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-2">
                          {download.links.map((link) => (
                            <a
                              key={link.provider}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm text-center"
                            >
                              {link.provider}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      ) : (
        <p>Stream not found.</p>
      )}
    </div>
  );
}
