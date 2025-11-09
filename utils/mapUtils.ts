import { Route } from '../types';

export const generateGoogleMapsUrl = (route: Route): string => {
  if (route.path.length < 2) {
    // Fallback for routes with less than 2 points to a simple search
    const query = encodeURIComponent(`${route.name}, Amherst, MA`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }
  
  const origin = `${route.path[0].lat},${route.path[0].lng}`;
  const destination = `${route.path[route.path.length - 1].lat},${route.path[route.path.length - 1].lng}`;
  const waypoints = route.path.slice(1, -1).map(p => `${p.lat},${p.lng}`).join('|');
  
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=walking`;
};
