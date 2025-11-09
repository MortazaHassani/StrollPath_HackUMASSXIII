import { Route, User } from './types';
import { getWarmImageUrl } from './utils/imageUtils';

export const CURRENT_USER_ID = 'user-you';

export const MOCK_USERS: User[] = [
  { 
    id: 'user-you', 
    name: 'Yejiiiiiiiiiiiiii', 
    imageUrl: null, 
    following: ['user-local-guide', 'user-history-buffs', 'user-mortaza'], 
    followers: ['user-trail-enthusiasts', 'user-joe'],
    isSearchable: true,
  },
  { 
    id: 'user-local-guide', 
    name: 'Abdul', 
    imageUrl: getWarmImageUrl('lg', 100, 100), 
    following: ['user-trail-enthusiasts'], 
    followers: ['user-you'],
    isSearchable: true, 
  },
  { 
    id: 'user-trail-enthusiasts', 
    name: 'Red', 
    imageUrl: getWarmImageUrl('te', 100, 100), 
    following: ['user-you'], 
    followers: ['user-local-guide'],
    isSearchable: true,
  },
  { 
    id: 'user-history-buffs', 
    name: 'History Buffs', 
    imageUrl: getWarmImageUrl('hb', 100, 100), 
    following: [], 
    followers: ['user-you'],
    isSearchable: false, // This user won't be found in search
  },
  { 
    id: 'user-mortaza', 
    name: 'Mortaza',
    imageUrl: getWarmImageUrl('mo', 100, 100), 
    following: [], 
    followers: ['user-you'],
    isSearchable: true,
  },
  {
    id: 'user-joe',
    name: 'Joe',
    imageUrl: getWarmImageUrl('jo', 100, 100),
    following: ['user-you'],
    followers: [],
    isSearchable: false, // This user won't be found in search
  }
];

export const MOCK_ROUTES: Route[] = [
  {
    id: '1',
    name: "Puffer's Pond Nature Trail",
    description: "A serene walk around the beautiful Puffer's Pond. Perfect for nature lovers, with opportunities for swimming in the summer. Mostly flat and family-friendly.",
    distance: 1.6,
    estimatedTime: 32,
    path: [
        { lat: 42.4005, lng: -72.5023 },
        { lat: 42.4018, lng: -72.5035 },
        { lat: 42.4031, lng: -72.5019 },
        { lat: 42.4015, lng: -72.4998 },
        { lat: 42.4005, lng: -72.5023 },
    ],
    isPublic: true,
    tags: ['nature', 'pond', 'easy', 'family-friendly'],
    likes: 13,
    authorId: 'user-local-guide',
    isLiked: true,
  },
  {
    id: '2',
    name: 'Amherst College Campus Stroll',
    description: 'Explore the historic and beautiful Amherst College campus. Walk past stunning architecture, the bird sanctuary, and the sprawling main quad.',
    distance: 1.9,
    estimatedTime: 38,
    path: [
        { lat: 42.371, lng: -72.518 },
        { lat: 42.373, lng: -72.519 },
        { lat: 42.374, lng: -72.516 },
        { lat: 42.372, lng: -72.515 },
        { lat: 42.371, lng: -72.518 },
    ],
    isPublic: true,
    tags: ['historic', 'architecture', 'easy', 'campus'],
    likes: 28,
    authorId: 'user-joe',
  },
  {
    id: '3',
    name: 'Norwottuck Rail Trail Adventure',
    description: 'A long, flat, paved path perfect for walking, jogging, or biking. This section takes you through peaceful woodlands towards the Connecticut River.',
    distance: 5.0,
    estimatedTime: 100,
    path: [
        { lat: 42.348, lng: -72.550 },
        { lat: 42.348, lng: -72.560 },
        { lat: 42.349, lng: -72.570 },
        { lat: 42.349, lng: -72.580 },
    ],
    isPublic: true,
    tags: ['flat', 'paved', 'scenic', 'long'],
    likes: 52,
    authorId: 'user-trail-enthusiasts',
  },
    {
    id: '4',
    name: 'Downtown Amherst History Walk',
    description: "A short loop through the heart of downtown Amherst. Discover the homes of famous poets like Emily Dickinson and enjoy the vibrant town center.",
    distance: 1.1,
    estimatedTime: 22,
    path: [
        { lat: 42.375, lng: -72.520 },
        { lat: 42.376, lng: -72.519 },
        { lat: 42.375, lng: -72.517 },
        { lat: 42.374, lng: -72.518 },
        { lat: 42.375, lng: -72.520 },
    ],
    isPublic: true,
    tags: ['city', 'historic', 'short'],
    likes: 41,
    authorId: 'user-history-buffs',
  },
  {
    id: '5',
    name: 'My Secret Garden Path',
    description: 'A quiet and personal route I discovered behind the community gardens. Not for sharing, just for my own quiet moments.',
    distance: 0.7,
    estimatedTime: 14,
    path: [{ lat: 42.381, lng: -72.525 }, { lat: 42.382, lng: -72.524 }],
    isPublic: false,
    tags: ['private', 'garden', 'quiet'],
    likes: 1,
    authorId: 'user-you',
    isLiked: true,
  }
];

export const MOCK_ACTIVITY_DATA: { [key: string]: { steps: number; routeId?: string } } = {
  '2024-07-02': { steps: 8345, routeId: '2' },
  '2024-07-03': { steps: 12890, routeId: '1' },
  '2024-07-05': { steps: 7630 },
  '2024-07-06': { steps: 15021, routeId: '3' },
  '2024-07-08': { steps: 9870, routeId: '4' },
  '2024-07-09': { steps: 6540 },
  '2024-07-10': { steps: 11320, routeId: '1' },
  '2024-07-12': { steps: 10500 },
  '2024-07-13': { steps: 8900, routeId: '2' },
  '2024-07-15': { steps: 13450, routeId: '3' },
  '2024-07-16': { steps: 4821 },
};