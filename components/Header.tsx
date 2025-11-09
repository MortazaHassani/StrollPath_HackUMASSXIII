import React from 'react';
import HeartIcon from './icons/HeartIcon';
import HeartIconFilled from './icons/HeartIconFilled';
import Logo from './Logo';

interface HeaderProps {
    onLogoClick: () => void;
    showFavoritesOnly: boolean;
    onToggleFavorites: () => void;
    isHomePage: boolean;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick, showFavoritesOnly, onToggleFavorites, isHomePage }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
        <div className="flex-1 flex justify-start">
          {/* Spacer to balance the heart icon on the right */}
        </div>

        <div className="flex-1 text-center">
            <div className="inline-block cursor-pointer" onClick={onLogoClick}>
                <Logo className="h-10 w-auto" />
            </div>
        </div>
        
        <div className="flex-1 flex justify-end items-center">
          {isHomePage && (
            <button 
              onClick={onToggleFavorites} 
              className={`p-2 rounded-full transition-colors ${showFavoritesOnly ? 'bg-red-100 text-red-500' : 'text-slate-600 hover:bg-slate-100'}`} 
              aria-label={showFavoritesOnly ? "Show all routes" : "Show favorite routes"}
            >
              {showFavoritesOnly ? <HeartIconFilled className="w-6 h-6" /> : <HeartIcon className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;