import React, { useState } from 'react';
import { Route, User } from '../types';
import RouteList from './RouteList';
import UserIcon from './icons/UserIcon';
import PencilIcon from './icons/PencilIcon';
import CheckIcon from './icons/CheckIcon';
import XIcon from './icons/XIcon';
import UserListModal from './UserListModal';
import SpinnerIcon from './icons/SpinnerIcon';


interface ProfileProps {
  user: User;
  currentUser: User;
  allUsers: User[];
  isCurrentUser: boolean;
  routes: Route[];
  onSelectRoute: (routeId: string) => void;
  onLike: (routeId: string) => void;
  onShare: (route: Route) => void;
  onProfileImageChange: (file: File) => void;
  isUploadingProfileImage: boolean;
  onUsernameChange: (newName: string) => void;
  onSearchabilityChange: (isSearchable: boolean) => void;
  dailyStepGoal: number;
  onSetDailyStepGoal: (goal: number) => void;
  onFollowToggle: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ 
    user, 
    currentUser,
    allUsers,
    isCurrentUser,
    routes, 
    onSelectRoute, 
    onLike, 
    onShare, 
    onProfileImageChange,
    isUploadingProfileImage,
    onUsernameChange,
    onSearchabilityChange,
    dailyStepGoal,
    onSetDailyStepGoal,
    onFollowToggle,
    onViewProfile,
    onLogout,
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyStepGoal);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [modalView, setModalView] = useState<'followers' | 'following' | null>(null);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        onProfileImageChange(file);
    }
  };

  const handleGoalSave = () => {
      onSetDailyStepGoal(tempGoal);
      setIsEditingGoal(false);
  }
  
  const handleNameSave = () => {
      if (tempName.trim()) {
          onUsernameChange(tempName.trim());
          setIsEditingName(false);
      }
  }

  const handleViewProfileFromModal = (userId: string) => {
    setModalView(null);
    onViewProfile(userId);
  };


  const isFollowing = currentUser.following.includes(user.id);

  return (
    <div className="animate-fade-in">
        <div className="text-center mb-6">
            <div className="relative w-24 h-24 mx-auto mb-4 group">
                {user.imageUrl ? (
                    <img src={user.imageUrl} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-md">
                        <UserIcon className="w-12 h-12 text-slate-500" />
                    </div>
                )}
                {isUploadingProfileImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                        <SpinnerIcon className="w-8 h-8 text-white animate-spin" />
                    </div>
                )}
                {isCurrentUser && !isUploadingProfileImage && (
                  <>
                    <label htmlFor="profile-pic-upload" className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer font-semibold text-sm">
                        Change
                    </label>
                    <input 
                        id="profile-pic-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isUploadingProfileImage}
                    />
                  </>
                )}
            </div>
            {/* Username section */}
            <div className="mt-1">
                {isCurrentUser && isEditingName ? (
                    <div className="flex justify-center items-center gap-2">
                         <input 
                            type="text" 
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                            className="text-3xl font-bold text-slate-800 bg-slate-100 border border-slate-300 rounded-md text-center p-1 w-64 focus:ring-amber-500 focus:border-amber-500"
                            autoFocus
                        />
                        <button onClick={handleNameSave} className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200" aria-label="Save name">
                           <CheckIcon className="w-6 h-6" />
                        </button>
                        <button onClick={() => { setIsEditingName(false); setTempName(user.name); }} className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200" aria-label="Cancel editing name">
                           <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                ) : (
                    <div className="relative inline-block">
                        <h1 className="text-3xl font-bold text-slate-800">{user.name}</h1>
                        {isCurrentUser && (
                            <button 
                                onClick={() => { setIsEditingName(true); setTempName(user.name); }} 
                                className="absolute top-1/2 -right-8 transform -translate-y-1/2 text-slate-400 hover:text-amber-500 p-1"
                                aria-label="Edit user name"
                            >
                                <PencilIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}
            </div>
            <p className="text-slate-500 mt-1">{routes.length} routes created</p>
        </div>

        <div className="flex justify-center gap-8 mb-6 text-center">
            <button onClick={() => setModalView('followers')} className="text-left rounded-md p-2 hover:bg-slate-100 transition-colors">
                <p className="text-xl font-bold text-slate-800 text-center">{user.followers.length}</p>
                <p className="text-sm text-slate-500">Followers</p>
            </button>
            <button onClick={() => setModalView('following')} className="text-left rounded-md p-2 hover:bg-slate-100 transition-colors">
                <p className="text-xl font-bold text-slate-800 text-center">{user.following.length}</p>
                <p className="text-sm text-slate-500">Following</p>
            </button>
        </div>
        
        <div className="max-w-md mx-auto mb-8 px-4">
            {!isCurrentUser ? (
                <button
                    onClick={() => onFollowToggle(user.id)}
                    className={`w-full font-bold py-2.5 px-4 rounded-lg transition-colors ${isFollowing ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
                >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
            ) : (
                 <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h2 className="text-sm font-medium text-slate-600 mb-2">Daily Step Goal</h2>
                        {isEditingGoal ? (
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    value={tempGoal}
                                    onChange={(e) => setTempGoal(Number(e.target.value))}
                                    className="flex-grow p-2 border border-slate-300 rounded-md focus:ring-amber-500 focus:border-amber-500 w-full"
                                />
                                <button onClick={handleGoalSave} className="bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600">Save</button>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                <p className="text-2xl font-bold text-slate-800">{dailyStepGoal.toLocaleString()} <span className="text-base font-normal text-slate-500">steps</span></p>
                                <button onClick={() => {setIsEditingGoal(true); setTempGoal(dailyStepGoal);}} className="flex items-center gap-1.5 text-sm font-semibold text-amber-500 hover:text-amber-700">
                                    <PencilIcon className="w-4 h-4" />
                                    Edit
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-sm font-medium text-slate-600">Profile Discoverability</h2>
                                <p className="text-xs text-slate-500 mt-1">Allow others to find you by searching your name.</p>
                            </div>
                            <button
                                onClick={() => onSearchabilityChange(!user.isSearchable)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${user.isSearchable ? 'bg-amber-500' : 'bg-slate-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.isSearchable ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onLogout}
                        className="w-full text-slate-600 font-semibold py-2.5 px-4 rounded-lg transition-colors bg-slate-100 hover:bg-slate-200 border border-slate-200"
                    >
                        Logout
                    </button>
                 </div>
            )}
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">{isCurrentUser ? "My Created Routes" : `${user.name}'s Routes`}</h2>
        <RouteList 
            routes={routes} 
            onLike={onLike}
            onSelectRoute={onSelectRoute}
            onShare={onShare}
        />

        {modalView && (
            <UserListModal
                title={modalView === 'followers' ? 'Followers' : 'Following'}
                userIds={modalView === 'followers' ? user.followers : user.following}
                allUsers={allUsers}
                currentUser={currentUser}
                onClose={() => setModalView(null)}
                onFollowToggle={onFollowToggle}
                onViewProfile={handleViewProfileFromModal}
            />
        )}
    </div>
  );
};

export default Profile;