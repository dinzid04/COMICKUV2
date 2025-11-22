import {
  Anime,
  AnimeHomeResponse,
  AnimeListResponse,
  AnimeDetailResponse,
  AnimeSearchResponse,
  AnimeStreamResponse,
} from "shared/anime-types.ts";
import {
  ManhwaListResponse,
  ManhwaDetail,
  ManhwaChapter,
} from "shared/types";

const API_URL = "https://www.sankavollerei.com";
const BACA_KOMIK_API_URL = `${API_URL}/comic/bacakomik`;
const KOMIK_STATION_API_URL = `${API_URL}/comic/komikstation`;
const ANIME_KURA_API_URL = `${API_URL}/anime/kura`;

// MANHWA
export async function getManhwaList(
  type: string,
  page: number = 1
): Promise<ManhwaListResponse> {
  const response = await fetch(`${BACA_KOMIK_API_URL}/list/${type}?page=${page}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export async function getManhwaDetail(slug: string): Promise<ManhwaDetail> {
  const response = await fetch(`${BACA_KOMIK_API_URL}/comic/${slug}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data.results;
}

export async function getManhwaChapter(
  slug: string
): Promise<ManhwaChapter | null> {
  try {
    const response = await fetch(`${KOMIK_STATION_API_URL}/chapter/${slug}`);
    if (!response.ok) {
      console.error("Failed to fetch chapter:", response.statusText);
      return null;
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching chapter:", error);
    return null;
  }
}

// ANIME
export async function getAnimeHome(): Promise<AnimeHomeResponse> {
  const response = await fetch(`${ANIME_KURA_API_URL}/home`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  // The home API already returns the 'image' field, so no mapping is needed.
  return response.json();
}

export async function getAnimeOngoing(
  page: number = 1
): Promise<AnimeListResponse> {
  const response = await fetch(
    `${ANIME_KURA_API_URL}/quick/ongoing?page=${page}`
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  // Map 'poster' to 'image' for consistency
  const mappedAnimes = data.animes.map((anime: any) => ({
    ...anime,
    image: anime.poster,
  }));
  return { ...data, animes: mappedAnimes };
}

export async function getAnimeFinished(
  page: number = 1
): Promise<AnimeListResponse> {
  const response = await fetch(
    `${ANIME_KURA_API_URL}/quick/finished?page=${page}`
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  // Map 'poster' to 'image' for consistency
  const mappedAnimes = data.animes.map((anime: any) => ({
    ...anime,
    image: anime.poster,
  }));
  return { ...data, animes: mappedAnimes };
}

export async function getAnimeMovie(
  page: number = 1
): Promise<AnimeListResponse> {
  const response = await fetch(`${ANIME_KURA_API_URL}/quick/movie?page=${page}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  // Map 'poster' to 'image' for consistency
  const mappedAnimes = data.animes.map((anime: any) => ({
    ...anime,
    image: anime.poster,
  }));
  return { ...data, animes: mappedAnimes };
}

export async function searchAnime(
  query: string
): Promise<AnimeSearchResponse> {
  const response = await fetch(`${ANIME_KURA_API_URL}/search/${query}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export async function getAnimeDetail(
  id: string,
  slug: string
): Promise<AnimeDetailResponse> {
  const response = await fetch(`${ANIME_KURA_API_URL}/anime/${id}/${slug}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export async function getAnimeStream(
  id: string,
  slug: string,
  episode: string
): Promise<AnimeStreamResponse> {
  const response = await fetch(
    `${ANIME_KURA_API_URL}/watch/${id}/${slug}/${episode}`
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}
