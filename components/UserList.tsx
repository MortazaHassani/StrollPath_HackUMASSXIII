import React from 'react';
import { User } from '../types';
import UserCard from './UserCard';

interface UserListProps {
  users: User[];
  currentUser: User;
  onFollowToggle: (userId: string) => void;
  onViewProfile: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, currentUser, onFollowToggle, onViewProfile }) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-slate-700">No Users Found</h2>
        <p className="text-slate-500 mt-2">Try adjusting your search query.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
      {users.map(user => (
        <UserCard
            key={user.id} 
            user={user} 
            currentUser={currentUser}
            onFollowToggle={onFollowToggle}
            onViewProfile={onViewProfile}
        />
      ))}
    </div>
  );
};

export default UserList;