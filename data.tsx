import { Route, User } from './types';
import { getWarmImageUrl } from './utils/imageUtils';

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