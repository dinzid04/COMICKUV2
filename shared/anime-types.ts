export interface AnimeHomeResponse {
  status: string;
  creator: string;
  hero: Hero[];
  ongoing: Ongoing[];
  completed: Completed[];
  movie: Movie[];
}

export interface Hero {
  title: string;
  id: string;
  slug: string;
  image: string;
  label: string[];
  description: string;
}

export interface Ongoing {
  title: string;
  id: string;
  slug: string;
  image: string;
  episode: string;
  rating: null;
  type: string;
  quality: string;
  status: string;
}

export interface Completed {
  title: string;
  id: string;
  slug: string;
  image: string;
  episode: null;
  rating: string;
  type: string;
  quality: string;
  status: string;
}

export interface Movie {
  title: string;
  id: string;
  slug: string;
  image: string;
  episode: null;
  rating: string;
  type: string;
  quality: string;
  status: string;
}

export interface AnimeListResponse {
  status: string;
  creator: string;
  source: string;
  animes: Anime[];
  pagination: Pagination;
}

export interface Anime {
  id: string;
  slug: string;
  title: string;
  image: string;
  score: string;
  views: string;
  tags: any[];
  url: string;
}

export interface Pagination {
  hasNext: boolean;
  hasPrev: boolean;
  currentPage: number;
}

export interface AnimeSearchResponse {
  status: string;
  creator: string;
  results: AnimeSearchResult[];
  pagination: any[];
}

export interface AnimeSearchResult {
  title: string;
  id: string;
  slug: string;
  image: string;
  episode: null;
  rating: string;
  type: string;
  quality: string;
  status: string;
}

export interface AnimeDetailResponse {
  status: string;
  creator: string;
  results: AnimeDetail;
}

export interface AnimeDetail {
  id: number;
  slug: string;
  title: string;
  title_raw: string;
  image: string;
  description: string;
  details: Detail[];
  episode: number[];
  batch: string[];
}

export interface Detail {
  type: string;
  data: null | string;
}

export interface AnimeStreamResponse {
  status: string;
  creator: string;
  source: string;
  title: string;
  streams: Stream[];
  downloads: Download[];
  navigation: Navigation;
}

export interface Download {
  quality_group: string;
  links: Link[];
}

export interface Link {
  provider: string;
  url: string;
}

export interface Navigation {
  prev: null;
  next: string;
}

export interface Stream {
  quality: string;
  url: string;
}
