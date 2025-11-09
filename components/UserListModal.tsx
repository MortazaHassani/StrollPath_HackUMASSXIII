import React from 'react';
import { User } from '../types';
import XIcon from './icons/XIcon';
import UserIcon from './icons/UserIcon';

interface UserListModalProps {
  title: string;
  userIds: string[];
  allUsers: User[];
  currentUser: User;
  onClose: () => void;
  onFollowToggle: (userId: string) => void;
  onViewProfile: (userId: string) => void;
}

const UserListModal: React.FC<UserListModalProps> = ({
  title,
  userIds,
  allUsers,
  currentUser,
  onClose,
  onFollowToggle,
  onViewProfile,
}) => {
  const usersToShow = userIds.map(id => allUsers.find(u => u.id === id)).filter((u): u is User => !!u);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><XIcon /></button>
        </div>
        <div className="overflow-y-auto">
          {usersToShow.length > 0 ? (
            usersToShow.map(user => {
              const isFollowing = currentUser.following.includes(user.id);
              const isSelf = user.id === currentUser.id;
              return (
                <div key={user.id} className="flex items-center justify-between p-3 hover:bg-slate-50">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewProfile(user.id)}>
                    {user.imageUrl ? (
                      <img src={user.imageUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-slate-500" />
                      </div>
                    )}
                    <span className="font-semibold text-slate-800">{user.name}</span>
                  </div>
                  {!isSelf && (
                    <button
                      onClick={() => onFollowToggle(user.id)}
                      className={`font-bold py-1.5 px-4 rounded-full text-sm transition-colors ${isFollowing ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
                    >
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-slate-500 text-center p-8">No users to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListModal;
