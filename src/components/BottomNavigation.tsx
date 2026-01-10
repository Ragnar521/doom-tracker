import { NavLink } from 'react-router-dom';

import iconTracker from '../assets/icons/icon_tracker.png';
import iconDashboard from '../assets/icons/icon_dashboard.png';
import iconAchievements from '../assets/icons/icon_achievements.png';
import iconSquad from '../assets/icons/icon_squad.png';
import iconSettings from '../assets/icons/icon_settings.png';

const NAV_ITEMS = [
  { path: '/', label: 'TRACK', icon: iconTracker },
  { path: '/dashboard', label: 'STATS', icon: iconDashboard },
  { path: '/achievements', label: 'GLORY', icon: iconAchievements },
  { path: '/squad', label: 'SQUAD', icon: iconSquad },
  { path: '/settings', label: 'CONFIG', icon: iconSettings },
];

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 doom-panel border-t-2 border-gray-700 safe-area-bottom">
      <div className="max-w-md mx-auto flex">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 transition-colors ${
                isActive
                  ? 'text-doom-red'
                  : 'text-gray-600 hover:text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <img
                  src={item.icon}
                  alt={item.label}
                  className={`w-6 h-6 transition-all ${isActive ? '' : 'opacity-50 grayscale'}`}
                  style={{ imageRendering: 'pixelated' }}
                />
                <span className="text-[8px] mt-1 tracking-wider">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
