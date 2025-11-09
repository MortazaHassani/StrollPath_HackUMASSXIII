import React from 'react';
import { AppView } from '../App';
import HomeIcon from './icons/HomeIcon';
import HomeIconFilled from './icons/HomeIconFilled';
import ChartBarIcon from './icons/ChartBarIcon';
import UserIcon from './icons/UserIcon';

interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  profileImageUrl?: string | null;
}

const NavItem: React.FC<NavItemProps> = ({ label, icon, activeIcon, isActive, onClick, profileImageUrl }) => {
  const activeClasses = 'text-amber-500';
  const inactiveClasses = 'text-slate-500';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center flex-1 transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses} hover:text-amber-500`}
    >
      {label === 'Profile' && profileImageUrl ? (
          <img src={profileImageUrl} alt="Profile" className={`w-7 h-7 rounded-full object-cover border-2 ${isActive ? 'border-amber-500' : 'border-transparent'}`} />
      ) : (
        <div className="w-7 h-7">{isActive ? activeIcon : icon}</div>
      )}
      <span className="text-xs font-medium mt-0.5">{label}</span>
    </button>
  );
};

interface BottomNavBarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  profileImageUrl?: string | null;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, onNavigate, profileImageUrl }) => {
  const navItems: { view: AppView; label: string; icon: React.ReactNode; activeIcon: React.ReactNode }[] = [
    { view: 'home', label: 'Home', icon: <HomeIcon />, activeIcon: <HomeIconFilled /> },
    { view: 'graph', label: 'Activity', icon: <ChartBarIcon />, activeIcon: <ChartBarIcon /> },
    { view: 'profile', label: 'Profile', icon: <UserIcon />, activeIcon: <UserIcon /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 shadow-top z-20 flex px-2">
      {navItems.map(item => (
        <NavItem
          key={item.view}
          label={item.label}
          icon={item.icon}
          activeIcon={item.activeIcon}
          isActive={currentView === item.view}
          onClick={() => onNavigate(item.view)}
          profileImageUrl={item.view === 'profile' ? profileImageUrl : null}
        />
      ))}
    </nav>
  );
};

export default BottomNavBar;