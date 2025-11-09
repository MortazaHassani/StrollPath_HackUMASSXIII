import React, { useState, useMemo, useEffect } from 'react';
import { Route, User, Coordinate } from './types';
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
import { auth, signOutUser, FirebaseUser, updateUserProfile, getOrCreateUserProfile, fetchAllData, addRouteToDb, toggleLikeInDb, toggleFollowInDb, updateUserDocument, updateRouteInDb, seedDatabase } from './services/firebase';
import Logo from './components/Logo';
import { resizeImage } from './utils/imageUtils';

export type DistanceFilter = 'any' | 'short' | 'medium' | 'long';
export type VisibilityFilter = 'all' | 'public' | 'private';
export type AppView = 'home' | 'graph' | 'profile';
export type SearchMode = 'routes' | 'users';
type DataLoadingState = 'idle' | 'loading' | 'success' | 'error';

// For passing data from CreateRouteForm to App
interface NewRouteData extends Omit<Route, 'id' | 'likes' | 'authorId' | 'isLiked' | 'imageUrl'> {
  imageFile?: File;
}
interface UpdateRouteData extends Partial<Omit<Route, 'id' | 'likes' | 'authorId' | 'isLiked' | 'imageUrl'>> {
  imageFile?: File | null; // File for new image, null for removed, undefined for unchanged
}


export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dataLoadingState, setDataLoadingState] = useState<DataLoadingState>('idle');
  const [showWelcome, setShowWelcome] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
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
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiFilteredRouteIds, setAiFilteredRouteIds] = useState<string[] | null>(null);
  const [activeAiQuery, setActiveAiQuery] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<SearchMode>('routes');
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const dailySteps = currentUser?.activity?.[todayString]?.steps ?? 0;
  const dailyStepGoal = currentUser?.dailyStepGoal ?? 10000;

  const loadDataForUser = async (user: FirebaseUser) => {
    setDataLoadingState('loading');
    setError(null);
    console.log("Step 1: Starting data load for user:", user.uid);
    try {
      console.log("Step 2: Getting or creating user profile...");
      // This call also creates the user doc if it's their first time.
      const userProfile = await getOrCreateUserProfile(user);
      console.log("Step 2a: User profile retrieved/created successfully.");
      
      console.log("Step 3: Seeding database if necessary...");
      await seedDatabase();
      console.log("Step 3a: Database seeding checked/completed.");

      console.log("Step 4: Fetching all users and routes...");
      const { users: fetchedUsers, routes: fetchedRoutes } = await fetchAllData(user.uid);
      console.log("Step 4a: Fetched", fetchedUsers.length, "users and", fetchedRoutes.length, "routes.");

      const loggedInUser = fetchedUsers.find(u => u.id === user.uid);

      if (!loggedInUser) {
        console.error("Critical error: Logged in user profile not found in fetched data.");
        throw new Error("Could not find your user profile after fetching data. Please try again.");
      }
      
      console.log("Step 5: All data loaded successfully. Updating application state.");
      setUsers(fetchedUsers);
      setRoutes(fetchedRoutes);
      setCurrentUser(loggedInUser); // Update with the full profile
      setDataLoadingState('success');
      setShowWelcome(true);

    } catch (err: any) {
      console.error("Data fetch error occurred at one of the steps:", err.message, "Code:", err.code);
      if (err.code === 'unavailable' || err.message.includes('offline')) {
        setError("You appear to be offline. Please check your internet connection.");
      } else {
        setError(err.message || "Could not connect to the service. Please try again later.");
      }
      setDataLoadingState('error');
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged( (user) => {
      if (user) {
        setFirebaseUser(user);
        
        // Immediately set a partial user to render the app shell.
        // This prevents the UI from being empty while we fetch full data.
        if (!currentUser) {
            const initialUser: User = {
                id: user.uid,
                name: user.displayName || 'Stroller',
                imageUrl: user.photoURL || null,
                following: [],
                followers: [],
                isSearchable: true,
                likedRoutes: [],
            };
            setCurrentUser(initialUser);
        }

        // Attempt to load full data from Firestore.
        loadDataForUser(user);

      } else {
        // Reset everything on logout
        setFirebaseUser(null);
        setCurrentUser(null);
        setUsers([]);
        setRoutes([]);
        setError(null);
        setDataLoadingState('idle');
      }
    });
    return () => unsubscribe();
  }, []); // This effect should only run once to set up the listener.
  
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
    if (!currentUser) return [];
    const tagSet = new Set<string>();
    routes.forEach(route => {
        if (route.isPublic || route.authorId === currentUser.id) {
             route.tags.forEach(tag => tagSet.add(tag))
        }
    });
    return Array.from(tagSet).sort();
  }, [routes, currentUser]);
  
  const filteredRoutes = useMemo(() => {
    if (searchMode !== 'routes' || !currentUser) return [];

    if (aiFilteredRouteIds) {
      const routeIdSet = new Set(aiFilteredRouteIds);
      return routes.filter(route => routeIdSet.has(route.id));
    }

    let results = routes;

    if (showFavoritesOnly) {
      results = results.filter(route => route.isLiked);
    } else {
      results = results.filter(route => route.isPublic || route.authorId === currentUser.id);
    }

    if (searchQuery.trim()) {
      results = results.filter(route =>
        route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
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
             results = results.filter(route => {
                if (visibilityFilter === 'public') return route.isPublic;
                // 'private' should only show the current user's private routes
                return !route.isPublic && route.authorId === currentUser.id;
            });
        }
    }

    return results;
  }, [routes, searchQuery, selectedTags, distanceFilter, visibilityFilter, showFavoritesOnly, aiFilteredRouteIds, searchMode, currentUser]);

  const filteredUsers = useMemo(() => {
    if (searchMode !== 'users' || !searchQuery.trim() || !currentUser) {
      return [];
    }
    return users.filter(user =>
      user.id !== currentUser.id &&
      user.isSearchable &&
      user.name.toLowerCase().startsWith(searchQuery.toLowerCase())
    );
  }, [users, searchQuery, searchMode, currentUser]);

  const simplifyPath = (path: Coordinate[], maxPoints = 500): Coordinate[] => {
    if (path.length <= maxPoints) {
        return path;
    }
    const simplified: Coordinate[] = [path[0]];
    const totalPoints = path.length;
    const interval = (totalPoints - 2) / (maxPoints - 2);
    for (let i = 1; i < maxPoints - 1; i++) {
        simplified.push(path[Math.round(i * interval)]);
    }
    simplified.push(path[totalPoints - 1]);
    return simplified;
  };

  const addRoute = async (newRouteData: NewRouteData) => {
    if (!firebaseUser || !currentUser) return;

    setIsSaving(true);

    try {
      let imageUrl: string | null = null;
      if (newRouteData.imageFile) {
        imageUrl = await resizeImage(newRouteData.imageFile, 800, 800);
      }

      const { imageFile, path, ...routeData } = newRouteData;
      const simplifiedPath = simplifyPath(path);

      const routePayload: Omit<Route, 'id' | 'likes' | 'isLiked'> = {
        ...routeData,
        path: simplifiedPath,
        authorId: firebaseUser.uid,
        imageUrl: imageUrl,
      };

      // 1. Add route to DB
      const newRouteFromDb = await addRouteToDb(routePayload);

      // 2. Prepare activity update
      const STEPS_PER_MILE = 2200;
      const steps = newRouteData.distance * STEPS_PER_MILE;
      const today = new Date();
      const todayStringForActivity = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const currentUserActivity = currentUser.activity || {};
      const todayActivity = currentUserActivity[todayStringForActivity] || { steps: 0 };

      const newActivity = {
        ...currentUserActivity,
        [todayStringForActivity]: {
            steps: todayActivity.steps + Math.round(steps),
            routeId: newRouteFromDb.id
        }
      };

      // 3. Update user document in DB
      await updateUserDocument(currentUser.id, { activity: newActivity });

      // 4. All DB operations successful, now update local state
      const updatedUser = { ...currentUser, activity: newActivity };
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      setRoutes(prev => [newRouteFromDb, ...prev]);

      setCreateModalOpen(false);
      setRouteToEdit(null);
    } catch (error) {
      console.error("Error adding route and activity:", error);
      alert("Failed to save your walk. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleUpdateRoute = async (updatedData: UpdateRouteData) => {
    if (!routeToEdit || !firebaseUser) return;
    
    setIsSaving(true);
    const originalRoutes = routes;
    const { imageFile, ...otherUpdates } = updatedData;

    try {
      let newImageUrl: string | null | undefined = routeToEdit.imageUrl;

      if (imageFile) { // A new file was provided to upload
        newImageUrl = await resizeImage(imageFile, 800, 800);
      } else if (imageFile === null) { // `null` signifies the image was removed
        newImageUrl = null;
      }
      // If `imageFile` is `undefined`, `newImageUrl` remains the same.

      const finalUpdates = { ...otherUpdates, imageUrl: newImageUrl };
      
      await updateRouteInDb(routeToEdit.id, finalUpdates);
      
      setRoutes(routes.map(r => r.id === routeToEdit.id ? { ...r, ...finalUpdates } as Route : r));
      
      setCreateModalOpen(false);
      setRouteToEdit(null);

    } catch(err) {
      console.error("Failed to update route:", err);
      setRoutes(originalRoutes); // Revert on error
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLike = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (!route || !currentUser) return;
    
    const originalRoutes = routes;
    setRoutes(routes.map(r => r.id === routeId ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 } : r));

    toggleLikeInDb(currentUser.id, routeId, !!route.isLiked).catch(err => {
        console.error("Failed to update like status:", err);
        setRoutes(originalRoutes);
        alert("Could not update like status. Please try again.");
    });
  };

  const handleFollowToggle = (userIdToToggle: string) => {
    if (!currentUser) return;
    const isFollowing = currentUser.following.includes(userIdToToggle);

    const originalUsers = users;
    const originalCurrentUser = currentUser;
    const newCurrentUser = { ...currentUser, following: isFollowing ? currentUser.following.filter(id => id !== userIdToToggle) : [...currentUser.following, userIdToToggle] };
    
    setCurrentUser(newCurrentUser);
    setUsers(currentUsers => {
        return currentUsers.map(user => {
            if (user.id === currentUser.id) {
                return newCurrentUser;
            }
            if (user.id === userIdToToggle) {
                return { ...user, followers: isFollowing ? user.followers.filter(id => id !== currentUser.id) : [...user.followers, currentUser.id] };
            }
            return user;
        });
    });

    toggleFollowInDb(currentUser.id, userIdToToggle, isFollowing).catch(err => {
        console.error("Failed to update follow status:", err);
        setUsers(originalUsers);
        // Revert currentUser as well
        setCurrentUser(originalCurrentUser);
    });
  };

  const selectedRoute = useMemo(() => {
    return routes.find(r => r.id === selectedRouteId) || null;
  }, [routes, selectedRouteId]);

  const selectedRouteAuthor = useMemo(() => {
    if (!selectedRoute) return null;
    return users.find(u => u.id === selectedRoute.authorId) || null;
  }, [selectedRoute, users]);
  
  const handleViewChange = (view: AppView, userId?: string) => {
      setSelectedRouteId(null);
      if (view === 'profile') {
        setViewedProfileId(userId || null);
      } else {
        setViewedProfileId(null);
      }
      setCurrentView(view);
      setShowFavoritesOnly(false);
      if (window.location.search) {
        window.history.pushState({}, '', window.location.pathname);
      }
  }
  
  const handleProfileImageChange = async (file: File) => {
    if (!firebaseUser || !currentUser) return;

    setIsUploadingProfileImage(true);
    try {
        const base64Url = await resizeImage(file, 300, 300);
        
        // The photoURL in Firebase Auth has a size limit which is too small
        // for a Base64 string. We only need to store it in Firestore.
        await updateUserDocument(currentUser.id, { imageUrl: base64Url });

        setCurrentUser(prevUser => (prevUser ? { ...prevUser, imageUrl: base64Url } : null));
        setUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? { ...u, imageUrl: base64Url } : u));
    } catch (error) {
        console.error("Error updating profile image:", error);
        alert("Could not update profile image. Please try again.");
    } finally {
        setIsUploadingProfileImage(false);
    }
  };

  const handleUsernameChange = async (newName: string) => {
    if (firebaseUser && currentUser) {
        const originalName = currentUser.name;
        const newCurrentUser = { ...currentUser, name: newName };
        setCurrentUser(newCurrentUser);
        setUsers(currentUsers => currentUsers.map(u => u.id === currentUser.id ? newCurrentUser : u));
        
        try {
            await updateUserProfile(firebaseUser, { displayName: newName });
            await updateUserDocument(currentUser.id, { name: newName });
        } catch (error) {
            console.error("Error updating username:", error);
            const revertedUser = { ...currentUser, name: originalName };
            setCurrentUser(revertedUser);
            setUsers(users.map(u => u.id === currentUser.id ? revertedUser : u));
            alert("Could not update username.");
        }
    }
  };

  const handleSearchabilityChange = (isSearchable: boolean) => {
    if(!currentUser) return;
    const originalUsers = users;
    const newCurrentUser = { ...currentUser, isSearchable };
    setCurrentUser(newCurrentUser);
    setUsers(currentUsers => currentUsers.map(u => 
        u.id === currentUser.id ? newCurrentUser : u
    ));
    updateUserDocument(currentUser.id, { isSearchable }).catch(err => {
        setUsers(originalUsers);
        setCurrentUser(currentUser);
        alert("Could not update discoverability preference.");
    });
  };

  const handleDailyStepGoalChange = async (newGoal: number) => {
    if (!currentUser) return;
    
    const originalUsers = users;
    const newCurrentUser = { ...currentUser, dailyStepGoal: newGoal };
    setCurrentUser(newCurrentUser);
    setUsers(currentUsers => currentUsers.map(u => u.id === currentUser.id ? newCurrentUser : u));

    try {
        await updateUserDocument(currentUser.id, { dailyStepGoal: newGoal });
    } catch (error) {
        console.error("Error updating step goal:", error);
        const originalCurrentUser = originalUsers.find(u => u.id === currentUser.id) || null;
        setUsers(originalUsers);
        setCurrentUser(originalCurrentUser);
        alert("Could not update step goal.");
    }
  };

  const handleLogout = async () => {
    try {
        await signOutUser();
        setCurrentView('home');
        setViewedProfileId(null);
        setSelectedRouteId(null);
    } catch(error) {
        console.error("Error signing out:", error);
    }
  };

  const handleAiSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!searchQuery.trim() || searchMode !== 'routes' || !currentUser) return;

    setIsAiSearching(true);
    setActiveAiQuery(searchQuery);
    setAiFilteredRouteIds([]);

    try {
        const routesToConsider = showFavoritesOnly
            ? routes.filter(route => route.isLiked)
            : routes.filter(route => route.isPublic || route.authorId === currentUser.id);
        const recommendedIds = await getAiRouteRecommendations(searchQuery, routesToConsider);
        setAiFilteredRouteIds(recommendedIds);
    } catch (error) {
        console.error("AI search failed:", error);
        alert("Sorry, the AI search is currently unavailable. Please try again later.");
        setActiveAiQuery(null);
    } finally {
        setIsAiSearching(false);
    }
  };

  const clearAiSearch = () => {
    setActiveAiQuery(null);
    setAiFilteredRouteIds(null);
    setSearchQuery('');
  };

  const handleSearchModeChange = (mode: SearchMode) => {
    setSearchMode(mode);
    setSearchQuery('');
    if (activeAiQuery) {
        clearAiSearch();
    }
  };

  if (!firebaseUser || !currentUser) {
    return <Login />;
  }
  
  const renderMainContent = () => {
    switch (dataLoadingState) {
      case 'loading':
      case 'idle':
        return (
          <div className="flex justify-center items-center h-64">
            <SpinnerIcon className="h-12 w-12 animate-spin text-amber-500" />
          </div>
        );
      case 'error':
        return (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-slate-800">Connection Problem</h2>
            <p className="text-slate-600 mt-2">{error}</p>
            <button
              onClick={() => firebaseUser && loadDataForUser(firebaseUser)}
              className="mt-6 bg-amber-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-amber-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        );
      case 'success':
        return renderCurrentView();
      default:
        return null;
    }
  };


  const renderCurrentView = () => {
    if (!currentUser) return null; // Safeguard
    
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
        return <ActivityGraph onSelectRoute={setSelectedRouteId} activity={currentUser.activity} />;
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
                isCurrentUser={profileUser.id === currentUser.id}
                routes={routes.filter(r => r.authorId === profileUser.id)}
                onSelectRoute={setSelectedRouteId}
                onLike={handleLike}
                onShare={setRouteToShare}
                onProfileImageChange={handleProfileImageChange}
                isUploadingProfileImage={isUploadingProfileImage}
                onUsernameChange={handleUsernameChange}
                onSearchabilityChange={handleSearchabilityChange}
                dailyStepGoal={profileUser.dailyStepGoal ?? 10000}
                onSetDailyStepGoal={handleDailyStepGoalChange}
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
        {dataLoadingState === 'success' && selectedRoute && selectedRouteAuthor && currentUser ? (
             <RouteDetail
                route={selectedRoute}
                author={selectedRouteAuthor}
                currentUser={currentUser}
                onBack={() => {
                    setSelectedRouteId(null);
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
            renderMainContent()
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
          isSaving={isSaving}
        />
      )}
      
      {routeToShare && (
        <ShareModal 
            route={routeToShare}
            onClose={() => setRouteToShare(null)}
        />
      )}

      {dataLoadingState !== 'error' && !selectedRoute && currentView === 'home' && (
          <button
              onClick={() => setCreateModalOpen(true)}
              className="fixed bottom-24 right-6 bg-amber-500 text-white p-4 rounded-full shadow-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-transform transform hover:scale-105 z-30"
              aria-label="Create new route"
          >
              <PlusIcon />
          </button>
      )}

      {currentUser && !selectedRoute && (
        <BottomNavBar 
            currentView={currentView}
            onNavigate={(view) => handleViewChange(view)}
            profileImageUrl={currentUser.imageUrl}
        />
      )}
    </div>
  );
}