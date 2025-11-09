import React from 'react';

interface TagProps {
  label: string;
  onClick?: (label: string) => void;
  isActive?: boolean;
}

const Tag: React.FC<TagProps> = ({ label, onClick, isActive }) => {
  const baseClasses = "text-xs font-semibold px-2.5 py-1 rounded-full capitalize";
  const activeClasses = "bg-amber-500 text-white";
  const inactiveClasses = "bg-amber-100 text-amber-800";
  const clickableClasses = "cursor-pointer hover:bg-amber-200 transition-colors";
  
  const finalClasses = `${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${onClick ? clickableClasses : ''}`;

  return (
    <span 
      className={finalClasses}
      onClick={() => onClick && onClick(label)}
    >
      #{label}
    </span>
  );
};

export default Tag;
