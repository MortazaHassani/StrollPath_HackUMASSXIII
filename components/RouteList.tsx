import React from 'react';
import { Route } from '../types';
import RouteCard from './RouteCard';

interface RouteListProps {
  routes: Route[];
  onLike: (routeId: string) => void;
  onSelectRoute: (routeId: string) => void;
  onShare: (route: Route) => void;
}

const RouteList: React.FC<RouteListProps> = ({ routes, onLike, onSelectRoute, onShare }) => {
  if (routes.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-slate-700">No Routes Found</h2>
        <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
      {routes.map(route => (
        <RouteCard 
            key={route.id} 
            route={route} 
            onLike={onLike}
            onSelect={() => onSelectRoute(route.id)}
            onShare={() => onShare(route)}
        />
      ))}
    </div>
  );
};

export default RouteList;
