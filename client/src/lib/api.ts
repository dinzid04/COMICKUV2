import type {
  ManhwaListItem,
  ManhwaTopItem,
  ManhwaDetail,
  ChapterData,
  GenreResponse,
  SearchResponse,
} from "@shared/types";

const BASE_URL = "/api";

export const api = {
  // Get manhwa lists
  getManhwaNew: async (): Promise<ManhwaListItem[]> => {
    const response = await fetch(`${BASE_URL}/manhwa-new`);
    if (!response.ok) throw new Error("Failed to fetch new manhwa");
    return response.json();
  },

  getManhwaPopular: async (): Promise<ManhwaListItem[]> => {
    const response = await fetch(`${BASE_URL}/manhwa-popular`);
    if (!response.ok) throw new Error("Failed to fetch popular manhwa");
    return response.json();
  },

  getManhwaTop: async (): Promise<ManhwaTopItem[]> => {
    const response = await fetch(`${BASE_URL}/manhwa-top`);
    if (!response.ok) throw new Error("Failed to fetch top manhwa");
    return response.json();
  },

  getManhwaOngoing: async (): Promise<ManhwaListItem[]> => {
    const response = await fetch(`${BASE_URL}/manhwa-ongoing`);
    if (!response.ok) throw new Error("Failed to fetch ongoing manhwa");
    return response.json();
  },

  getManhwaRecommendation: async (): Promise<ManhwaListItem[]> => {
    const response = await fetch(`${BASE_URL}/manhwa-recommendation`);
    if (!response.ok) throw new Error("Failed to fetch recommendations");
    return response.json();
  },

  // Get manhwa detail
  getManhwaDetail: async (manhwaId: string): Promise<ManhwaDetail> => {
    const response = await fetch(`${BASE_URL}/manhwa-detail/${manhwaId}`);
    if (!response.ok) throw new Error("Failed to fetch manhwa details");
    return response.json();
  },

  // Get chapter data
  getChapter: async (chapterId: string): Promise<ChapterData> => {
    const response = await fetch(`${BASE_URL}/chapter/${chapterId}`);
    if (!response.ok) throw new Error("Failed to fetch chapter");
    return response.json();
  },

  // Get genres
  getGenres: async (): Promise<GenreResponse> => {
    const response = await fetch(`${BASE_URL}/genres`);
    if (!response.ok) throw new Error("Failed to fetch genres");
    return response.json();
  },

  // Search manhwa
  searchManhwa: async (query: string): Promise<SearchResponse> => {
    const response = await fetch(`${BASE_URL}/search/${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Failed to search manhwa");
    return response.json();
  },
};

// Helper to extract manhwa ID from URL
export const extractManhwaId = (url: string): string => {
    try {
        // Coba parsing sebagai URL lengkap
        const urlObject = new URL(url);
        const pathParts = urlObject.pathname.split('/').filter(part => part);
        // Ambil bagian terakhir dari path, yang seharusnya menjadi ID/slug
        return pathParts[pathParts.length - 1] || url;
    } catch (error) {
        // Jika gagal (misalnya, ini adalah path relatif seperti /manga/slug), lakukan parsing manual
        const pathParts = url.split('/').filter(part => part);
        // Ambil bagian terakhir dari path
        return pathParts[pathParts.length - 1] || url;
    }
};

// Helper to extract chapter ID from URL
export const extractChapterId = (url: string): string => {
  const match = url.match(/\/([^/]+)\/?$/);
  return match ? match[1] : url;
};
