import type {
  HomePageResponse,
  ManhwaListResponse,
  ManhwaTopResponse,
  ManhwaDetail,
  ChapterData,
  SearchResponse,
} from "@shared/types";

const BASE_URL = "https://www.sankavollerei.com/comic/komikstation";
const BASE_GET = " https://www.sankavollerei.com/comic/bacakomik";
export const api = {
  // Get home page data (trending and latest updates)
  getHomePage: async (): Promise<HomePageResponse> => {
    const response = await fetch(`${BASE_URL}/home`);
    if (!response.ok) throw new Error("Failed to fetch home page data");
    return response.json();
  },

  // Get manhwa lists with pagination
  getManhwaNew: async (page = 1): Promise<ManhwaListResponse> => {
    const response = await fetch(`${BASE_URL}/list?type=manga&status=ongoing&order=latest&page=${page}`);
    if (!response.ok) throw new Error("Failed to fetch new manhwa");
    return response.json();
  },

  getManhwaPopular: async (page = 1): Promise<ManhwaListResponse> => {
    const response = await fetch(`${BASE_URL}/popular?page=${page}`);
    if (!response.ok) throw new Error("Failed to fetch popular manhwa");
    return response.json();
  },

  getManhwaOngoing: async (page = 1): Promise<ManhwaListResponse> => {
    const response = await fetch(`${BASE_URL}/ongoing?page=${page}`);
    if (!response.ok) throw new Error("Failed to fetch ongoing manhwa");
    return response.json();
  },

  // Get manhwa lists without pagination
  getManhwaTop: async (): Promise<ManhwaTopResponse> => {
    const response = await fetch(`${BASE_URL}/top-weekly`);
    if (!response.ok) throw new Error("Failed to fetch top manhwa");
    return response.json();
  },

  getManhwaRecommendation: async (): Promise<ManhwaListResponse> => {
    const response = await fetch(`${BASE_URL}/recommendation`);
    if (!response.ok) throw new Error("Failed to fetch recommendations");
    return response.json();
  },

  // Get manhwa detail
  getManhwaDetail: async (manhwaId: string): Promise<ManhwaDetail> => {
    const response = await fetch(`${BASE_URL}/manga/${manhwaId}`);
    if (!response.ok) throw new Error("Failed to fetch manhwa details");
    return response.json();
  },

  // Get chapter data
  getChapter: async (chapterId: string): Promise<ChapterData> => {
    const response = await fetch(`${BASE_GET}/chapter/${chapterId}`);
    if (!response.ok) throw new Error("Failed to fetch chapter");
    return response.json();
  },

  // Search manhwa
  searchManhwa: async (query: string): Promise<SearchResponse> => {
    const response = await fetch(`${BASE_URL}/search/${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Failed to search manhwa");
    return response.json();
  },
};

// Helper to extract manhwa ID from URL/slug
export const extractManhwaId = (slug: string): string => {
    const parts = slug.split('/').filter(part => part);
    return parts[parts.length - 1] || slug;
};

// Helper to extract chapter ID from URL/slug
export const extractChapterId = (slug: string): string => {
  const parts = slug.split('/').filter(part => part);
  return parts[parts.length - 1] || slug;
};
