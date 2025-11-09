import React from 'react';
import { User } from '../types';
import UserIcon from './icons/UserIcon';
import UsersIcon from './icons/UsersIcon';

interface UserCardProps {
  user: User;
  currentUser: User;
  onFollowToggle: (userId: string) => void;
  onViewProfile: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, currentUser, onFollowToggle, onViewProfile }) => {

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFollowToggle(user.id);
  };
  
  const isFollowing = currentUser.following.includes(user.id);

  return (
    <div 
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col cursor-pointer text-center p-4"
        onClick={() => onViewProfile(user.id)}
    >
      {user.imageUrl ? (
        <img className="w-20 h-20 mx-auto rounded-full object-cover" src={user.imageUrl} alt={user.name} />
      ) : (
        <div className="w-20 h-20 mx-auto rounded-full bg-slate-200 flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-slate-500" />
        </div>
      )}
      <h2 className="text-base font-bold text-slate-900 mt-3 truncate">{user.name}</h2>
      <div className="flex items-center justify-center text-xs text-slate-500 mt-1">
        <UsersIcon className="h-4 w-4 mr-1" />
        <span>{user.followers.length} Followers</span>
      </div>
      <div className="mt-4">
        <button
          onClick={handleFollowClick}
          className={`w-full font-bold py-2 px-4 rounded-lg text-sm transition-colors ${isFollowing ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
        >
          {isFollowing ? 'Unfollow' : 'Follow'}
        </button>
      </div>
    </div>
  );
};

export default UserCard;