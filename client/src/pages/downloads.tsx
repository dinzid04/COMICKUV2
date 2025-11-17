import React, { useState, useEffect } from 'react';
import { getAllDownloadedComics } from '@/lib/offline-db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'wouter';
import { SEO } from '@/components/seo';

interface DownloadedChapter {
  chapterId: string;
  comicSlug: string;
  chapterTitle: string;
  status: string;
}

const DownloadsPage: React.FC = () => {
  const [downloadedComics, setDownloadedComics] = useState<{ [key: string]: DownloadedChapter[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDownloads = async () => {
      setLoading(true);
      const comics = await getAllDownloadedComics();
      setDownloadedComics(comics);
      setLoading(false);
    };
    fetchDownloads();
  }, []);

  if (loading) {
    return <div className="container mx-auto max-w-7xl px-4 py-8">Loading downloads...</div>;
  }

  return (
    <>
    <SEO title="My Downloads" description="Access your downloaded chapters for offline reading." />
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-4xl font-bold mb-8">My Downloads</h1>
      {Object.keys(downloadedComics).length === 0 ? (
        <p>You haven't downloaded any chapters yet.</p>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(downloadedComics).map(([comicSlug, chapters]) => (
            <AccordionItem value={comicSlug} key={comicSlug}>
              <AccordionTrigger>
                <h2 className="text-xl font-semibold">{chapters[0]?.comicSlug || 'Unknown Comic'}</h2>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2">
                  {chapters.map(chapter => (
                    <Link key={chapter.chapterId} href={`/chapter/${chapter.chapterId}?offline=true`}>
                      <a className="block p-4 bg-muted hover:bg-muted/50 rounded-lg">
                        {chapter.chapterTitle}
                      </a>
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
    </>
  );
};

export default DownloadsPage;
