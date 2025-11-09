import React, { useState } from 'react';
import { MOCK_ACTIVITY_DATA } from '../data';
import MapPinIcon from './icons/MapPinIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';

interface ActivityGraphProps {
    onSelectRoute: (routeId: string) => void;
}

const ActivityGraph: React.FC<ActivityGraphProps> = ({ onSelectRoute }) => {
  const [currentDate, setCurrentDate] = useState(new Date('2024-07-16')); // Set to a date with mock data

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const startDayOfWeek = startOfMonth.getDay(); // 0 = Sunday, 1 = Monday, ...

  const calendarDays = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  }
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100"><ArrowLeftIcon className="w-5 h-5"/></button>
            <h2 className="text-xl font-bold text-slate-800">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100"><ArrowRightIcon className="w-5 h-5"/></button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold text-slate-500 mb-2">
            {weekDays.map(day => <div key={day}>{day}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
                if (!day) return <div key={`empty-${index}`} className="aspect-square"></div>;
                
                const dateString = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                const activity = MOCK_ACTIVITY_DATA[dateString];
                const isToday = new Date().toDateString() === day.toDateString();

                return (
                <div key={day.toISOString()} className={`aspect-square border rounded-lg p-1.5 flex flex-col justify-between text-left text-xs md:text-sm ${isToday ? 'bg-amber-50 border-amber-200' : 'border-slate-200'}`}>
                    <span className={`font-bold ${isToday ? 'text-amber-500' : 'text-slate-700'}`}>{day.getDate()}</span>
                    {activity && (
                    <div className="mt-auto">
                        <p className="font-semibold text-slate-800 leading-tight">{(activity.steps / 1000).toFixed(1)}k</p>
                        <p className="text-slate-500 leading-tight">steps</p>
                        {activity.routeId && (
                           <button onClick={() => onSelectRoute(activity.routeId!)} className="mt-1 text-amber-500 hover:text-amber-700 w-full flex justify-end">
                             <MapPinIcon className="w-4 h-4" />
                           </button>
                        )}
                    </div>
                    )}
                </div>
                );
            })}
        </div>
    </div>
  );
};

export default ActivityGraph;

// Simple ArrowRightIcon for calendar navigation
const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);
