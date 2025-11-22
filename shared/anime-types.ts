export interface AnimeHome {
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

export interface AnimeList {
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
  poster: string;
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

export interface AnimeSearch {
  status: string;
  creator: string;
  results: SearchResult[];
  pagination: any[];
}

export interface SearchResult {
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

export interface AnimeDetail {
  status: string;
  creator: string;
  results: DetailResult;
}

export interface DetailResult {
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

export interface AnimeStream {
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
