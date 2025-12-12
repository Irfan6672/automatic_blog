export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  SCHEDULED = 'SCHEDULED'
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Markdown or HTML
  author: string;
  publishDate: string; // ISO string
  status: PostStatus;
  tags: string[];
  coverImage?: string; // Base64 or URL
  images?: string[]; // Array of images for carousel
  metaDescription?: string;
  slug: string;
}

export interface ContentConfig {
  imageCount: number;
  includeFaq: boolean;
  sectionCount: number;
  useCarousel: boolean;
  imageSource: 'AI' | 'SEARCH' | 'BOTH';
}

export interface ScheduleConfig {
  id: string;
  topic: string;
  frequency: 'daily' | 'weekly' | 'custom';
  intervalHours?: number; // For custom
  nextRun: string; // ISO string
  enabled: boolean;
  postsPerRun: number;
  contentConfig?: ContentConfig;
}

export interface AIModelConfig {
  apiKey: string;
}
