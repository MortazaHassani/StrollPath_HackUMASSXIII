import React from 'react';
import { Route, User } from '../types';
import MapPinIcon from './icons/MapPinIcon';
import ClockIcon from './icons/ClockIcon';
import HeartIcon from './icons/HeartIcon';
import HeartIconFilled from './icons/HeartIconFilled';
import ShareIcon from './icons/ShareIcon';
import MapIcon from './icons/MapIcon';
import GlobeAltIcon from './icons/GlobeAltIcon';
import LockClosedIcon from './icons/LockClosedIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import PencilIcon from './icons/PencilIcon';
import UserIcon from './icons/UserIcon';
import Tag from './Tag';
import { generateGoogleMapsUrl } from '../utils/mapUtils';
import { getWarmImageUrl } from '../utils/imageUtils';

interface RouteDetailProps {
  route: Route;
  author: User;
  onBack: () => void;
  onLike: (routeId: string) => void;
  onShare: (route: Route) => void;
  onEdit: () => void;
  onViewProfile: (authorId: string) => void;
}

const RouteDetail: React.FC<RouteDetailProps> = ({ route, author, onBack, onLike, onShare, onEdit, onViewProfile }) => {

  const handleViewOnMap = () => {
    const url = generateGoogleMapsUrl(route);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-fade-in">
      <div className="relative">
        <img className="w-full h-48 md:h-64 object-cover" src={route.imageUrl || getWarmImageUrl(route.id, 800, 400)} alt="Route landscape" />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 bg-white bg-opacity-75 p-2 rounded-full text-slate-800 hover:bg-opacity-100 transition-all"
          aria-label="Back to routes"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4 md:p-6">
        <div className="flex justify-between items-start mb-2">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{route.name}</h1>
                <div className="flex items-center mt-1">
                    {author.imageUrl ? (
                        <img src={author.imageUrl} alt={author.name} className="w-6 h-6 rounded-full mr-2" />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center mr-2">
                          <UserIcon className="w-4 h-4 text-slate-500" />
                        </div>
                    )}
                    <button onClick={() => onViewProfile(author.id)} className="text-sm text-slate-500 hover:text-amber-600 font-medium">
                        by {author.name}
                    </button>
                </div>
            </div>
            {route.isPublic ? (
               <div className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap">
                 <GlobeAltIcon className="w-4 h-4" /> Public
               </div>
            ) : (
                <div className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap">
                  <LockClosedIcon className="w-4 h-4" /> Private
                </div>
            )}
        </div>
        
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-slate-600 my-4 border-y py-3">
             <div className="flex items-center font-medium">
                <MapPinIcon className="h-5 w-5 mr-1.5 text-amber-500" />
                <span>{route.distance.toFixed(1)} miles</span>
            </div>
            <div className="flex items-center font-medium">
                <ClockIcon className="h-5 w-5 mr-1.5 text-amber-500" />
                <span>{route.estimatedTime} min</span>
            </div>
        </div>

        <p className="text-slate-700 leading-relaxed mb-4">{route.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-6">
            {route.tags.map(tag => <Tag key={tag} label={tag} />)}
        </div>

        <div className="flex items-center justify-between gap-4">
            <button
                onClick={() => onLike(route.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-lg ${route.isLiked ? 'bg-red-50 text-red-600 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                aria-label={`Like ${route.name}`}
            >
                {route.isLiked ? <HeartIconFilled className="h-6 w-6" /> : <HeartIcon className="h-6 w-6" />}
                <span>{route.likes}</span>
            </button>
            <div className="flex items-center gap-2">
                {author.id === 'user-you' && (
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-2 bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors"
                    aria-label={`Edit ${route.name}`}
                  >
                    <PencilIcon className="h-5 w-5" /> Edit
                  </button>
                )}
                <button
                onClick={() => onShare(route)}
                className="flex items-center gap-2 bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors"
                aria-label={`Share ${route.name}`}
                >
                    <ShareIcon className="h-5 w-5" /> Share
                </button>
                 <button
                onClick={handleViewOnMap}
                className="flex items-center gap-2 bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors"
                aria-label={`View ${route.name} on map`}
                >
                    <MapIcon className="h-5 w-5" /> View on Map
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDetail;
