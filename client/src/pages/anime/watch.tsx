import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { api } from '@/lib/api';
import { SEO } from '@/components/seo';
import VideoPlayer from '@/components/anime/VideoPlayer';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Loader2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

const AnimeWatchPage: React.FC = () => {
  const { id, slug, episode } = useParams<{ id: string; slug: string; episode: string }>();
  const [, navigate] = useLocation();
  const [selectedQuality, setSelectedQuality] = useState<string>('');

  const { data: streamData, isLoading: isLoadingStream, error: streamError } = useQuery({
    queryKey: ['anime/stream', id, slug, episode],
    queryFn: () => api.getAnimeStream(id!, slug!, parseInt(episode!)),
    enabled: !!id && !!slug && !!episode,
    retry: false,
  });

  const { data: detailData } = useQuery({
    queryKey: ['anime/detail', id, slug],
    queryFn: () => api.getAnimeDetail(id!, slug!),
    enabled: !!id && !!slug,
  });

  useEffect(() => {
    if (streamData?.streams && streamData.streams.length > 0) {
      setSelectedQuality(streamData.streams[0].url);
    }
  }, [streamData]);

  const handleNextEpisode = () => {
    if (streamData?.navigation.next) {
      navigate(`/anime/watch/${id}/${slug}/${streamData.navigation.next}`);
    }
  };

  const handlePrevEpisode = () => {
    if (streamData?.navigation.prev) {
      navigate(`/anime/watch/${id}/${slug}/${streamData.navigation.prev}`);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <SEO
        title={streamData?.title || `Menonton ${slug} Episode ${episode}`}
        description={`Streaming ${slug} episode ${episode} subtitle Indonesia.`}
      />
      <div className="container mx-auto max-w-5xl py-8 px-4">
        {isLoadingStream && (
          <div className="flex flex-col justify-center items-center h-[80vh]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="mt-4 text-lg">Memuat Episode...</p>
          </div>
        )}

        {streamError && (
          <div className="text-center py-20">
            <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Gagal Memuat Video</h2>
            <p className="text-muted-foreground">Episode ini mungkin belum tersedia atau terjadi kesalahan.</p>
            <Button onClick={() => navigate(`/anime/detail/${id}/${slug}`)} className="mt-4">
              Kembali ke Detail
            </Button>
          </div>
        )}

        {streamData && (
          <>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">{streamData.title}</h1>

            {selectedQuality && <VideoPlayer streamUrl={selectedQuality} onEnded={handleNextEpisode} />}

            <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
              <div className="flex items-center gap-2">
                <p>Kualitas:</p>
                <Select onValueChange={setSelectedQuality} defaultValue={selectedQuality}>
                  <SelectTrigger className="w-[120px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Pilih Kualitas" />
                  </SelectTrigger>
                  <SelectContent>
                    {streamData.streams.map((stream) => (
                      <SelectItem key={stream.quality} value={stream.url}>
                        {stream.quality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handlePrevEpisode} disabled={!streamData.navigation.prev}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Prev
                </Button>
                <Button onClick={handleNextEpisode} disabled={!streamData.navigation.next}>
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            <div className="mt-8">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="downloads">
                  <AccordionTrigger className="text-xl font-semibold">
                    Tautan Unduhan
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {streamData.downloads.map((group, index) => (
                        <div key={index} className="p-4 bg-gray-800 rounded-lg">
                          <h4 className="font-bold mb-2">{group.quality_group}</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {group.links.map((link, linkIndex) => (
                              <a href={link.url} target="_blank" rel="noopener noreferrer" key={linkIndex}>
                                <Button variant="outline" className="w-full border-gray-600 hover:bg-gray-700">
                                  {link.provider}
                                </Button>
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

            {detailData && (
                 <div className="mt-8">
                 <h2 className="text-2xl font-bold mb-4">Daftar Episode</h2>
                 <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                   {detailData.results.episode.map((ep) => (
                     <Link key={ep} href={`/anime/watch/${id}/${slug}/${ep}`}>
                       <Button variant={ep.toString() === episode ? "default" : "outline"} className="w-full">
                         Eps {ep}
                       </Button>
                     </Link>
                   ))}
                 </div>
               </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnimeWatchPage;
