import React from 'react';
import { Route } from '../types';
import MapPinIcon from './icons/MapPinIcon';
import ClockIcon from './icons/ClockIcon';
import HeartIcon from './icons/HeartIcon';
import HeartIconFilled from './icons/HeartIconFilled';
import ShareIcon from './icons/ShareIcon';
import MapIcon from './icons/MapIcon';
import GlobeAltIcon from './icons/GlobeAltIcon';
import LockClosedIcon from './icons/LockClosedIcon';
import { generateGoogleMapsUrl } from '../utils/mapUtils';
import { getWarmImageUrl } from '../utils/imageUtils';

interface RouteCardProps {
  route: Route;
  onLike: (routeId: string) => void;
  onSelect: () => void;
  onShare: () => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, onLike, onSelect, onShare }) => {
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when liking
    onLike(route.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when sharing
    onShare();
  };
  
  const handleMapClick = (e: React.MouseEvent) => {
     e.stopPropagation();
     const url = generateGoogleMapsUrl(route);
     window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div 
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col cursor-pointer"
        onClick={onSelect}
    >
      <div className="relative">
         <img className="w-full object-cover aspect-square" src={route.imageUrl || getWarmImageUrl(route.id, 400, 400)} alt="Route landscape" />
         <div className="absolute top-2 right-2">
            {route.isPublic ? (
               <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                 <GlobeAltIcon className="w-3 h-3" /> Public
               </div>
            ) : (
                <div className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <LockClosedIcon className="w-3 h-3" /> Private
                </div>
            )}
         </div>
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <h2 className="text-base font-bold text-slate-900 mb-1 truncate">{route.name}</h2>
        
        <div className="flex justify-between text-xs text-slate-500 mb-3">
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4" />
            <span className="ml-1">{route.distance.toFixed(1)} mi</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4" />
            <span className="ml-1">{route.estimatedTime} min</span>
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={handleLikeClick}
            className={`flex items-center transition-colors ${route.isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}
            aria-label={`Like ${route.name}`}
          >
            {route.isLiked ? <HeartIconFilled className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}
            <span className="ml-1 text-sm font-medium">{route.likes}</span>
          </button>
          <div className="flex items-center">
            <button
              onClick={handleMapClick}
              className="p-1.5 text-slate-500 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-colors"
              aria-label={`View ${route.name} on map`}
            >
              <MapIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleShareClick}
              className="p-1.5 text-slate-500 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-colors"
              aria-label={`Share ${route.name}`}
            >
              <ShareIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteCard;