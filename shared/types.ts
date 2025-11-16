// TypeScript interfaces for API responses from https://www.sankavollerei.com/comic/komikstation

// For paginated lists
export interface Pagination {
  currentPage: number;
  hasNextPage: boolean;
  nextPage: number | null;
}

// Generic item in a Manhwa list
export interface ManhwaListItem {
  title: string;
  slug: string;
  imageSrc: string;
  rating?: string;
  latestChapter?: string;
  chapter?: string; // Used in popular/recommendation
  chapters?: Array<{ // Used in home.latestUpdates
    slug: string;
    title: string;
    timeAgo: string;
  }>;
}

// Response for Home page
export interface HomePageResponse {
    trending: ManhwaListItem[];
    latestUpdates: ManhwaListItem[];
}

// Response for lists like new, popular, ongoing
export interface ManhwaListResponse {
  creator?: string;
  success?: boolean;
  pagination?: Pagination;
  results: ManhwaListItem[];
}

// For Top Weekly list
export interface ManhwaTopItem {
  rank: string;
  title: string;
  slug: string;
  image: string;
  genres: string[];
  rating: string;
}

export interface ManhwaTopResponse {
    recommendations: ManhwaTopItem[];
}

// For Manhwa Detail page
export interface ManhwaDetail {
  creator?: string;
  success?: boolean;
  title: string;
  alternative?: string;
  imageSrc: string;
  rating: string;
  synopsis: string;
  status: string;
  type: string;
  author?: string;
  updatedOn?: string;
  genres: Array<{
    name: string;
    slug: string;
  }>;
  chapters: Array<{
    title: string;
    slug: string;
    date: string;
  }>;
}

// For Chapter page
export interface ChapterData {
  creator: string;
  success: boolean;
  title: string;
  images: string[];
  prevSlug: string | null;
  nextSlug: string | null;
}

// For Search results
export interface SearchResult {
  title: string;
  slug: string;
  image: string;
  latestChapter: string;
  rating: string;
}

export interface SearchResponse {
  seriesList: SearchResult[];
}

// For Genre lists
export interface Genre {
  label: string;
  value: string;
}

export interface GenreListResponse {
  creator: string;
  success: boolean;
  genres: Genre[];
}

export interface ManhwaByGenreItem {
  title: string;
  slug: string;
  image: string;
  latestChapter: string;
  rating: string;
}

export interface ManhwaByGenreResponse {
  creator: string;
  success: boolean;
  seriesList: ManhwaByGenreItem[];
  nextPage?: string | null;
}

// For User Profile
export interface User {
  uid: string;
  nickname: string;
  email: string;
  photoUrl?: string;
  bannerUrl?: string;
  bio?: string;
  socialLinks?: {
    whatsapp?: string;
    github?: string;
    instagram?: string;
    tiktok?: string;
    other?: string;
  };
  chaptersRead?: number;
  verification?: 'verified' | 'admin' | null;
}

// For Comments
export interface Comment {
  userId: string;
  commentText: string;
  createdAt: any; // Firestore Timestamp
  displayName: string;
  photoURL?: string;
}

// For Room Chat
export interface ChatMessage {
  userId: string;
  text: string;
  createdAt: any; // Firestore Timestamp
  displayName: string;
  photoURL?: string;
  mentions?: string[]; // Array of user UIDs
}
