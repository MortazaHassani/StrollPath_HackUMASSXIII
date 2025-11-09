import React, { useState, useMemo, useEffect } from 'react';
import { Route, User } from './types';
import { MOCK_ROUTES, MOCK_USERS, CURRENT_USER_ID } from './data';
import Header from './components/Header';
import RouteList from './components/RouteList';
import UserList from './components/UserList';
import CreateRouteForm from './components/CreateRouteForm';
import FilterPanel from './components/FilterPanel';
import PlusIcon from './components/icons/PlusIcon';
import FilterIcon from './components/icons/FilterIcon';
import RouteDetail from './components/RouteDetail';
import ShareModal from './components/ShareModal';
import Profile from './components/Profile';
import BottomNavBar from './components/BottomNavBar';
import ActivityGraph from './components/ActivityGraph';
import Login from './components/Login';
import { getAiRouteRecommendations } from './services/geminiService';
import SparklesIcon from './components/icons/SparklesIcon';
import SpinnerIcon from './components/icons/SpinnerIcon';
import XIcon from './components/icons/XIcon';
import WelcomeScreen from './components/WelcomeScreen';

export type DistanceFilter = 'any' | 'short' | 'medium' | 'long';
export type VisibilityFilter = 'all' | 'public' | 'private';
export type AppView = 'home' | 'graph' | 'profile';
export type SearchMode = 'routes' | 'users';


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [routes, setRoutes] = useState<Route[]>(MOCK_ROUTES);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [routeToShare, setRouteToShare] = useState<Route | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [routeToEdit, setRouteToEdit] = useState<Route | null>(null);
  const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>('any');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [viewedProfileId, setViewedProfileId] = useState<string | null>(null);
  const [dailySteps, setDailySteps] = useState(4821);
  const [dailyStepGoal, setDailyStepGoal] = useState(10000);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiFilteredRouteIds, setAiFilteredRouteIds] = useState<string[] | null>(null);
  const [activeAiQuery, setActiveAiQuery] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<SearchMode>('routes');

  const currentUser = useMemo(() => users.find(u => u.id === CURRENT_USER_ID)!, [users]);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const routeId = params.get('routeId');
    if (routeId) {
      const routeExists = routes.some(r => r.id === routeId);
      if (routeExists) {
        setSelectedRouteId(routeId);
      }
    }
  }, [routes]);

  useEffect(() => {
    if (showWelcome) {
        const timer = setTimeout(() => {
            setShowWelcome(false);
        }, 2000); // Welcome message for 2 seconds
        return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    routes.forEach(route => {
        if (route.isPublic || route.authorId === CURRENT_USER_ID) {
             route.tags.forEach(tag => tagSet.add(tag))
        }
    });
    return Array.from(tagSet).sort();
  }, [routes]);
  
  const filteredRoutes = useMemo(() => {
    if (searchMode !== 'routes') return [];

    if (aiFilteredRouteIds) {
      const routeIdSet = new Set(aiFilteredRouteIds);
      return routes.filter(route => routeIdSet.has(route.id));
    }

    let results = routes;

    // Filter by favorites first if needed
    if (showFavoritesOnly) {
      results = results.filter(route => route.isLiked);
    } else {
      // Otherwise, filter by discoverability
      results = results.filter(route => route.isPublic || route.authorId === CURRENT_USER_ID);
    }

    // Always apply search query
    if (searchQuery.trim()) {
      results = results.filter(route =>
        route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply panel filters only when not in favorites mode
    if (!showFavoritesOnly) {
        if (selectedTags.length > 0) {
            results = results.filter(route => selectedTags.every(tag => route.tags.includes(tag)));
        }

        if (distanceFilter !== 'any') {
            results = results.filter(route => {
                 switch (distanceFilter) {
                    case 'short': return route.distance < 2;
                    case 'medium': return route.distance >= 2 && route.distance <= 5;
                    case 'long': return route.distance > 5;
                    default: return true;
                }
            });
        }
        
        if (visibilityFilter !== 'all') {
            results = results.filter(route => visibilityFilter === 'public' ? route.isPublic : !route.isPublic);
        }
    }

    return results;
  }, [routes, searchQuery, selectedTags, distanceFilter, visibilityFilter, showFavoritesOnly, aiFilteredRouteIds, searchMode]);

  const filteredUsers = useMemo(() => {
    if (searchMode !== 'users' || !searchQuery.trim()) {
      return [];
    }
    return users.filter(user =>
      user.id !== CURRENT_USER_ID &&
      user.isSearchable &&
      user.name.toLowerCase().startsWith(searchQuery.toLowerCase())
    );
  }, [users, searchQuery, searchMode]);


  const addRoute = (newRoute: Omit<Route, 'id' | 'likes' | 'authorId'>) => {
    const route: Route = {
      ...newRoute,
      id: Date.now().toString(),
      likes: 0,
      authorId: CURRENT_USER_ID,
      isLiked: false,
    };
    setRoutes(prevRoutes => [route, ...prevRoutes]);
    setCreateModalOpen(false);
  };
  
  const handleUpdateRoute = (updatedData: Partial<Route>) => {
    if (!routeToEdit) return;
    setRoutes(routes.map(r => r.id === routeToEdit.id ? { ...r, ...updatedData } : r));
    setRouteToEdit(null); // Close modal on save
  };

  const handleLike = (routeId: string) => {
    setRoutes(routes.map(r => {
      if (r.id === routeId) {
        return { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 };
      }
      return r;
    }));
  };

  const handleFollowToggle = (userIdToToggle: string) => {
    setUsers(currentUsers => {
        const isFollowing = currentUser.following.includes(userIdToToggle);
        return currentUsers.map(user => {
            // Toggle following state for current user
            if (user.id === CURRENT_USER_ID) {
                return {
                    ...user,
                    following: isFollowing 
                        ? user.following.filter(id => id !== userIdToToggle)
                        : [...user.following, userIdToToggle]
                };
            }
            // Toggle followers state for target user
            if (user.id === userIdToToggle) {
                return {
                    ...user,
                    followers: isFollowing
                        ? user.followers.filter(id => id !== CURRENT_USER_ID)
                        : [...user.followers, CURRENT_USER_ID]
                };
            }
            return user;
        });
    });
  };

  const selectedRoute = useMemo(() => {
    return routes.find(r => r.id === selectedRouteId) || null;
  }, [routes, selectedRouteId]);

  const selectedRouteAuthor = useMemo(() => {
    if (!selectedRoute) return null;
    return users.find(u => u.id === selectedRoute.authorId);
  }, [selectedRoute, users]);
  
  const handleViewChange = (view: AppView, userId?: string) => {
      setSelectedRouteId(null);
      if (view === 'profile') {
        setViewedProfileId(userId || null);
      } else {
        setViewedProfileId(null);
      }
      setCurrentView(view);
      setShowFavoritesOnly(false); // Reset favorites filter on view change
      // Clean up URL query params when navigating
      if (window.location.search) {
        window.history.pushState({}, '', window.location.pathname);
      }
  }
  
  const handleProfileImageChange = (url: string) => {
    setUsers(currentUsers => currentUsers.map(u => 
        u.id === CURRENT_USER_ID ? { ...u, imageUrl: url } : u
    ));
  };

  const handleUsernameChange = (newName: string) => {
    setUsers(currentUsers => currentUsers.map(u => 
        u.id === CURRENT_USER_ID ? { ...u, name: newName } : u
    ));
  };

  const handleSearchabilityChange = (isSearchable: boolean) => {
    setUsers(currentUsers => currentUsers.map(u => 
        u.id === CURRENT_USER_ID ? { ...u, isSearchable } : u
    ));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('home');
    setViewedProfileId(null);
    setSelectedRouteId(null);
  };
  
  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowWelcome(true);
  };

  const handleAiSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!searchQuery.trim() || searchMode !== 'routes') return;

    setIsAiSearching(true);
    setActiveAiQuery(searchQuery);
    setAiFilteredRouteIds([]); // Clear previous results while loading new ones

    try {
        const routesToConsider = showFavoritesOnly
            ? routes.filter(route => route.isLiked)
            : routes.filter(route => route.isPublic || route.authorId === CURRENT_USER_ID);
        const recommendedIds = await getAiRouteRecommendations(searchQuery, routesToConsider);
        setAiFilteredRouteIds(recommendedIds);
    } catch (error) {
        console.error("AI search failed:", error);
        alert("Sorry, the AI search is currently unavailable. Please try again later.");
        setActiveAiQuery(null); // Clear query on failure
    } finally {
        setIsAiSearching(false);
    }
  };

  const clearAiSearch = () => {
    setActiveAiQuery(null);
    setAiFilteredRouteIds(null);
    setSearchQuery(''); // Also clear the search input
  };

  const handleSearchModeChange = (mode: SearchMode) => {
    setSearchMode(mode);
    setSearchQuery('');
    if (activeAiQuery) {
        clearAiSearch();
    }
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        const progressPercentage = Math.min((dailySteps / dailyStepGoal) * 100, 100);
        const isAiFilterActive = !!activeAiQuery;

        return (
          <>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <div className="flex justify-between items-baseline mb-2">
                    <h3 className="text-sm font-medium text-slate-600">Today's Steps</h3>
                    <span className="text-sm font-medium text-slate-500">{dailySteps.toLocaleString()} / {dailyStepGoal.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>
            
            <div className="mb-4">
                <div className="flex w-full bg-slate-200 p-1 rounded-full">
                    <button onClick={() => handleSearchModeChange('routes')} className={`w-1/2 py-2 text-sm font-bold rounded-full transition-colors ${searchMode === 'routes' ? 'bg-white text-amber-600 shadow' : 'text-slate-600'}`}>Routes</button>
                    <button onClick={() => handleSearchModeChange('users')} className={`w-1/2 py-2 text-sm font-bold rounded-full transition-colors ${searchMode === 'users' ? 'bg-white text-amber-600 shadow' : 'text-slate-600'}`}>Users</button>
                </div>
            </div>

            <form onSubmit={searchMode === 'routes' ? handleAiSearch : (e) => e.preventDefault()} className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex items-center gap-2 md:gap-4">
                    <input
                        type="text"
                        placeholder={
                            searchMode === 'routes' 
                            ? (showFavoritesOnly ? "Search your favorites..." : "Ask for a recommendation...")
                            : "Search for users by name..."
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-grow p-2 border border-slate-300 rounded-md focus:ring-amber-500 focus:border-amber-500 w-full disabled:bg-slate-100 disabled:cursor-not-allowed"
                        disabled={isAiFilterActive}
                    />
                    {searchMode === 'routes' && (
                        <>
                        <button
                            type="submit"
                            className="p-2 border bg-amber-500 text-white border-amber-600 rounded-md hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Get AI recommendations"
                            disabled={!searchQuery.trim() || isAiSearching || isAiFilterActive}
                        >
                            {isAiSearching ? <SpinnerIcon className="h-6 w-6 animate-spin" /> : <SparklesIcon className="h-6 w-6" />}
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterPanelOpen(true)}
                            className="p-2 border bg-slate-100 border-slate-300 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Open filters"
                            disabled={isAiFilterActive || showFavoritesOnly}
                        >
                            <FilterIcon className="h-6 w-6 text-slate-600" />
                        </button>
                        </>
                    )}
                </div>
                {activeAiQuery && (
                    <div className="mt-3 flex items-center justify-between p-2 bg-amber-50 rounded-md">
                        <p className="text-sm text-amber-800">
                            <span className="font-semibold">AI Results for:</span> "{activeAiQuery}"
                        </p>
                        <button onClick={clearAiSearch} className="p-1 rounded-full text-amber-600 hover:bg-amber-100" aria-label="Clear AI search">
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </form>
            
            {showFavoritesOnly && searchMode === 'routes' && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-center font-semibold text-sm">
                    Showing all your favorite routes.
                </div>
            )}

            {searchMode === 'routes' ? (
                <RouteList routes={filteredRoutes} onLike={handleLike} onSelectRoute={setSelectedRouteId} onShare={setRouteToShare} />
            ) : (
                <UserList users={filteredUsers} currentUser={currentUser} onFollowToggle={handleFollowToggle} onViewProfile={(userId) => handleViewChange('profile', userId)} />
            )}
          </>
        );
      case 'graph':
        return <ActivityGraph onSelectRoute={setSelectedRouteId}/>;
      case 'profile':
        const profileUser = viewedProfileId ? users.find(u => u.id === viewedProfileId) : currentUser;
        if (!profileUser) {
          return (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-slate-700">User Not Found</h2>
              <button onClick={() => setViewedProfileId(null)} className="mt-4 text-amber-600 font-semibold">
                  Back to My Profile
              </button>
            </div>
          );
        }
        return (
            <Profile 
                user={profileUser}
                currentUser={currentUser}
                allUsers={users}
                isCurrentUser={profileUser.id === CURRENT_USER_ID}
                routes={routes.filter(r => r.authorId === profileUser.id)}
                onSelectRoute={setSelectedRouteId}
                onLike={handleLike}
                onShare={setRouteToShare}
                onProfileImageChange={handleProfileImageChange}
                onUsernameChange={handleUsernameChange}
                onSearchabilityChange={handleSearchabilityChange}
                dailyStepGoal={dailyStepGoal}
                onSetDailyStepGoal={setDailyStepGoal}
                onFollowToggle={handleFollowToggle}
                onViewProfile={(userId) => handleViewChange('profile', userId)}
                onLogout={handleLogout}
            />
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {showWelcome && <WelcomeScreen username={currentUser.name} />}
      <Header 
        onLogoClick={() => handleViewChange('home')} 
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={() => {
            setShowFavoritesOnly(!showFavoritesOnly);
            if (activeAiQuery) clearAiSearch();
        }}
        isHomePage={currentView === 'home' && !selectedRoute && searchMode === 'routes'}
      />
      <main className="container mx-auto p-4 md:p-6">
        {selectedRoute && selectedRouteAuthor ? (
             <RouteDetail
                route={selectedRoute}
                author={selectedRouteAuthor}
                onBack={() => {
                    setSelectedRouteId(null);
                    // Clean up URL query params when going back
                    if (window.location.search) {
                        window.history.pushState({}, '', window.location.pathname);
                    }
                }}
                onLike={handleLike}
                onShare={setRouteToShare}
                onEdit={() => setRouteToEdit(selectedRoute)}
                onViewProfile={(authorId) => handleViewChange('profile', authorId)}
            />
        ) : (
            renderCurrentView()
        )}
      </main>

      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        allTags={allTags}
        distanceFilter={distanceFilter}
        setDistanceFilter={setDistanceFilter}
        visibilityFilter={visibilityFilter}
        setVisibilityFilter={setVisibilityFilter}
      />

      {(isCreateModalOpen || routeToEdit) && (
        <CreateRouteForm
          onClose={() => {
            setCreateModalOpen(false);
            setRouteToEdit(null);
          }}
          onSave={addRoute}
          onUpdate={handleUpdateRoute}
          editingRoute={routeToEdit}
        />
      )}
      
      {routeToShare && (
        <ShareModal 
            route={routeToShare}
            onClose={() => setRouteToShare(null)}
        />
      )}

      {!selectedRoute && currentView === 'home' && (
          <button
              onClick={() => setCreateModalOpen(true)}
              className="fixed bottom-24 right-6 bg-amber-500 text-white p-4 rounded-full shadow-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-transform transform hover:scale-105 z-30"
              aria-label="Create new route"
          >
              <PlusIcon />
          </button>
      )}

      {!selectedRoute && (
        <BottomNavBar 
            currentView={currentView}
            onNavigate={(view) => handleViewChange(view)}
            profileImageUrl={currentUser.imageUrl}
        />
      )}
    </div>
  );
}