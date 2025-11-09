import React from 'react';
import Tag from './Tag';
import { DistanceFilter, VisibilityFilter } from '../App';
import XIcon from './icons/XIcon';

interface FilterButtonProps {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}

const FilterButton: React.FC<FilterButtonProps> = ({ onClick, isActive, children }) => {
  const baseClasses = "px-3 py-1.5 text-sm font-medium rounded-full transition-colors";
  const activeClasses = "bg-amber-500 text-white";
  const inactiveClasses = "bg-slate-200 text-slate-700 hover:bg-slate-300";
  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {children}
    </button>
  );
};


interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  allTags: string[];
  distanceFilter: DistanceFilter;
  setDistanceFilter: (filter: DistanceFilter) => void;
  visibilityFilter: VisibilityFilter;
  setVisibilityFilter: (filter: VisibilityFilter) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  isOpen,
  onClose,
  selectedTags, setSelectedTags, allTags,
  distanceFilter, setDistanceFilter,
  visibilityFilter, setVisibilityFilter
}) => {
  
  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const distanceOptions: { key: DistanceFilter; label: string }[] = [
    { key: 'any', label: 'Any' },
    { key: 'short', label: '< 2 mi' },
    { key: 'medium', label: '2-5 mi' },
    { key: 'long', label: '> 5 mi' },
  ];

  const visibilityOptions: { key: VisibilityFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'public', label: 'Public' },
    { key: 'private', label: 'Private' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
        ></div>
        
        {/* Panel */}
        <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl flex flex-col transition-transform transform translate-x-0">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Filters</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
                    <XIcon />
                </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-slate-600 mb-2">Distance</h3>
                    <div className="flex flex-wrap gap-2">
                        {distanceOptions.map(({ key, label }) => (
                        <FilterButton key={key} onClick={() => setDistanceFilter(key)} isActive={distanceFilter === key}>
                            {label}
                        </FilterButton>
                        ))}
                    </div>
                </div>
                
                <div>
                    <h3 className="text-sm font-medium text-slate-600 mb-2">Visibility</h3>
                    <div className="flex flex-wrap gap-2">
                        {visibilityOptions.map(({ key, label }) => (
                        <FilterButton key={key} onClick={() => setVisibilityFilter(key)} isActive={visibilityFilter === key}>
                            {label}
                        </FilterButton>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-slate-600">Filter by tags:</h3>
                        {selectedTags.length > 0 && (
                            <button 
                                onClick={() => setSelectedTags([])}
                                className="text-sm font-medium text-amber-500 hover:text-amber-700"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                    {allTags.length > 0 ? allTags.map(tag => (
                        <Tag
                        key={tag}
                        label={tag}
                        onClick={handleTagClick}
                        isActive={selectedTags.includes(tag)}
                        />
                    )) : <p className="text-sm text-slate-500">No tags available for current selection.</p>}
                    </div>
                </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t">
                <button onClick={onClose} className="w-full bg-amber-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-amber-600">
                    Apply Filters
                </button>
            </div>
        </div>
    </div>
  );
};

export default FilterPanel;
