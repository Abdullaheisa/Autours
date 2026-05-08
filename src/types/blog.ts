import { Status } from "./common";

export interface Blog {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  authorAvatar: string;
  category: string;
  status: Status;
  date: string;
  time: string;
  image: string;
  publishDate?: string;
  publishTime?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  image: string;
  publishedAt: string;
  readTime: string;
}
