import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ChapterData } from '@shared/types';

interface OfflineChapter extends ChapterData {
  chapterId: string;
  imagesAsBlobs: Blob[];
}

interface DownloadQueueItem {
  chapterId: string;
  comicSlug: string;
  chapterTitle: string;
  status: 'pending' | 'downloading' | 'completed' | 'error';
}

interface ComicDB extends DBSchema {
  chapters: {
    key: string;
    value: OfflineChapter;
  };
  download_queue: {
    key: string;
    value: DownloadQueueItem;
    indexes: { 'comicSlug': string };
  };
}

let dbPromise: Promise<IDBPDatabase<ComicDB>>;

const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<ComicDB>('comic-offline-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('chapters')) {
          db.createObjectStore('chapters', { keyPath: 'chapterId' });
        }
        if (!db.objectStoreNames.contains('download_queue')) {
          const store = db.createObjectStore('download_queue', { keyPath: 'chapterId' });
          store.createIndex('comicSlug', 'comicSlug');
        }
      },
    });
  }
  return dbPromise;
};

export const getChapterFromDB = async (chapterId: string): Promise<OfflineChapter | undefined> => {
  const db = await initDB();
  return db.get('chapters', chapterId);
};

export const saveChapterToDB = async (chapterData: OfflineChapter) => {
  const db = await initDB();
  await db.put('chapters', chapterData);
};

export const getDownloadStatus = async (chapterId: string): Promise<DownloadQueueItem | undefined> => {
    const db = await initDB();
    return db.get('download_queue', chapterId);
}

export const updateDownloadStatus = async (status: DownloadQueueItem) => {
    const db = await initDB();
    await db.put('download_queue', status);
}

export const getDownloadedChaptersByComic = async (comicSlug: string): Promise<DownloadQueueItem[]> => {
    const db = await initDB();
    return db.getAllFromIndex('download_queue', 'comicSlug', comicSlug);
}

export const getAllDownloadedComics = async () => {
    const db = await initDB();
    const downloadedChapters = await db.getAll('download_queue');

    const comics: { [key: string]: DownloadQueueItem[] } = {};
    for (const chapter of downloadedChapters) {
        if (!comics[chapter.comicSlug]) {
            comics[chapter.comicSlug] = [];
        }
        comics[chapter.comicSlug].push(chapter);
    }
    return comics;
}
