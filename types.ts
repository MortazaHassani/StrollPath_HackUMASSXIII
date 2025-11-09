export interface Coordinate {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  imageUrl: string | null;
  following: string[]; // Array of user IDs
  followers: string[]; // Array of user IDs
  isSearchable?: boolean;
}

export interface Route {
  id: string;
  name: string;
  description: string;
  distance: number; // in kilometers
  estimatedTime: number; // in minutes
  path: Coordinate[];
  isPublic: boolean;
  tags: string[];
  likes: number;
  authorId: string;
  isLiked?: boolean;
  imageUrl?: string;
}