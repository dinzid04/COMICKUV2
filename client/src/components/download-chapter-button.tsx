import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check, Loader2, AlertCircle } from 'lucide-react';
import { getDownloadStatus, updateDownloadStatus, saveChapterToDB } from '@/lib/offline-db';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface DownloadChapterButtonProps {
  chapterId: string;
  comicSlug: string;
  chapterTitle: string;
}

const DownloadChapterButton: React.FC<DownloadChapterButtonProps> = ({ chapterId, comicSlug, chapterTitle }) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'downloading' | 'completed' | 'error'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    const checkStatus = async () => {
      const download = await getDownloadStatus(chapterId);
      if (download) {
        setStatus(download.status);
      }
    };
    checkStatus();
  }, [chapterId]);

  const handleDownload = async () => {
    setStatus('pending');
    await updateDownloadStatus({ chapterId, comicSlug, chapterTitle, status: 'pending' });
    toast({ title: "Added to Queue", description: `${chapterTitle} will be downloaded.` });

    // This is a placeholder for the actual download logic which will be triggered by a service worker or a background process.
    // For now, we'll simulate the download process here.
    try {
        setStatus('downloading');
        await updateDownloadStatus({ chapterId, comicSlug, chapterTitle, status: 'downloading' });

        const chapterData = await api.getChapter(chapterId);
        const imageBlobs = await Promise.all(
            chapterData.images.map(async (url) => {
                const response = await fetch(url);
                return response.blob();
            })
        );

        await saveChapterToDB({ ...chapterData, imagesAsBlobs: imageBlobs, chapterId: chapterId });

        setStatus('completed');
        await updateDownloadStatus({ chapterId, comicSlug, chapterTitle, status: 'completed' });
        toast({ title: "Download Complete", description: `${chapterTitle} is now available offline.` });

    } catch (error) {
        setStatus('error');
        await updateDownloadStatus({ chapterId, comicSlug, chapterTitle, status: 'error' });
        toast({ title: "Download Failed", description: `Could not download ${chapterTitle}.`, variant: 'destructive' });
    }
  };

  const renderButton = () => {
    switch (status) {
      case 'pending':
        return <Button variant="ghost" size="icon" disabled><Loader2 className="h-5 w-5 animate-spin" /></Button>;
      case 'downloading':
        return <Button variant="ghost" size="icon" disabled><Loader2 className="h-5 w-5 animate-spin" /></Button>;
      case 'completed':
        return <Button variant="ghost" size="icon" disabled><Check className="h-5 w-5 text-green-500" /></Button>;
      case 'error':
        return <Button variant="ghost" size="icon" onClick={handleDownload}><AlertCircle className="h-5 w-5 text-red-500" /></Button>;
      default:
        return <Button variant="ghost" size="icon" onClick={handleDownload}><Download className="h-5 w-5" /></Button>;
    }
  };

  return renderButton();
};

export default DownloadChapterButton;
