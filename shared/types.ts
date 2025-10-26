// TypeScript interfaces untuk API responses dari https://mnhwa-api.vercel.app/api

export interface ManhwaListItem {
  title: string;
  link: string;
  imageSrc?: string;
  imageUrl?: string;
  chapters?: Array<{
    chapterLink: string;
    chapterTitle: string;
    timeAgo: string;
  }>;
  chapter?: string;
  rating?: string;
  latestChapter?: string;
}

export interface ManhwaTopItem {
  rank: string;
  title: string;
  url: string;
  image: string;
  genres: string[];
  rating: string;
}

export interface ManhwaDetail {
  title: string;
  alternative?: string;
  imageSrc: string;
  rating: string;
  followedBy?: string;
  synopsis: string;
  firstChapter?: {
    title: string;
    link: string;
  };
  latestChapter?: {
    title: string;
    link: string;
  };
  status: string;
  type: string;
  released?: string;
  author?: string;
  artist?: string;
  updatedOn?: string;
  genres: Array<{
    genreName: string;
    genreLink: string;
  }>;
  chapters: Array<{
    chapterNum: string;
    chapterLink: string;
    chapterDate: string;
    downloadLink?: string;
  }>;
}

export interface ChapterData {
  title: string;
  images: string[];
  prevChapter: string | null;
  nextChapter: string | null;
  chapters?: Array<{
    title: string;
    url: string | null;
  }>;
  prevButtonUrl?: string;
  nextButtonUrl?: string;
}

export interface Genre {
  label: string;
  value: string;
}

export interface GenreResponse {
  genres: Genre[];
}

export interface SearchResult {
  title: string;
  url: string;
  image: string;
  latestChapter: string;
  rating: string;
}

export interface SearchResponse {
  seriesList: SearchResult[];
  pagination?: Array<{
    pageUrl: string;
    pageNumber: string;
  }>;
  nextPage?: string;
}
