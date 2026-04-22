import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FiHome, FiBook, FiUsers, FiSettings, FiCheckCircle, 
  FiBarChart2, FiPlus, FiShoppingCart, FiTrendingUp,
  FiShield, FiUserCheck, FiChevronDown, FiChevronRight,
  FiList, FiGrid, FiFileText, FiVideo, FiAward, FiTarget
} from 'react-icons/fi';
import { 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaUserGraduate,
  FaUserShield,
  FaClipboardList,
  FaBookOpen,
  FaChartLine,
  FaUsersCog
} from 'react-icons/fa';
import { HiOutlineCollection, HiOutlineAcademicCap } from 'react-icons/hi';
import { PERMISSIONS } from '../../lib/permissions';


type SidebarItem = {
  label: string;
  href?: string;
  icon: JSX.Element | string;
  permission?: (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
  children?: SidebarItem[]; // Sous-menus
};

interface SidebarProps {
  items: SidebarItem[];
  userPermissions?: ((typeof PERMISSIONS)[keyof typeof PERMISSIONS])[];
}

const iconMap: { [key: string]: React.ReactNode } = {
  '📊': <FiBarChart2 className="w-5 h-5" />,
  '📚': <FiBook className="w-5 h-5" />,
  '👥': <FiUsers className="w-5 h-5" />,
  '🔐': <FiShield className="w-5 h-5" />,
  '➕': <FiPlus className="w-5 h-5" />,
  '✅': <FiCheckCircle className="w-5 h-5" />,
  '📈': <FiTrendingUp className="w-5 h-5" />,
  '👨‍🏫': <FaChalkboardTeacher className="w-5 h-5" />,
  '🛒': <FiShoppingCart className="w-5 h-5" />,
  '📖': <FiBook className="w-5 h-5" />,
};

const Sidebar: React.FC<SidebarProps> = ({ items, userPermissions = [] }) => {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredItems = items.filter(item => {
    if (!item.permission) return true;
    return userPermissions.includes(item.permission);
  });

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isItemActive = (item: SidebarItem): boolean => {
    if (item.href) {
      return router.pathname === item.href || router.pathname.startsWith(item.href + '/');
    }
    if (item.children) {
      return item.children.some(child => isItemActive(child));
    }
    return false;
  };

  const renderItem = (item: SidebarItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const isActive = isItemActive(item);
    const hasActiveChild = hasChildren && item.children!.some(child => isItemActive(child));

    // Auto-expand si un enfant est actif
    if (hasActiveChild && !isExpanded) {
      setExpandedItems(prev => [...prev, item.label]);
    }

    return (
      <li key={item.label} className={level > 0 ? 'ml-1' : 'mb-1'}>
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleExpand(item.label)}
              className={`
                w-full flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-300 group relative
                ${isActive || hasActiveChild
                  ? 'bg-gradient-to-r from-platform-950 via-platform-600 to-platform-400 text-white shadow-xl shadow-platform-600/25' 
                  : 'text-gray-300 hover:bg-gradient-to-r hover:from-gray-700/60 hover:to-gray-700/40 hover:text-white hover:shadow-lg'
                }
              `}
            >
              <div className="flex items-center space-x-4">
                <span className={`flex-shrink-0 transition-all duration-300 ${isActive || hasActiveChild ? 'scale-110' : 'group-hover:scale-110'} ${isExpanded ? 'rotate-12' : ''}`}>
                  {typeof item.icon === 'string' ? iconMap[item.icon] || item.icon : item.icon}
                </span>
                <span className="font-semibold text-sm tracking-wide">{item.label}</span>
              </div>
              <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${isActive || hasActiveChild ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                {isExpanded ? (
                  <FiChevronDown className="w-4 h-4" />
                ) : (
                  <FiChevronRight className="w-4 h-4" />
                )}
              </span>
              {(isActive || hasActiveChild) && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg"></div>
              )}
            </button>
            {isExpanded && (
              <ul className="mt-2.5 ml-6 space-y-2 border-l-2 border-platform-600/35 pl-4 animate-fadeIn">
                {item.children!.map(child => renderItem(child, level + 1))}
              </ul>
            )}
          </>
        ) : (
          <Link
            href={item.href || '#'}
            className={`
              flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden
              ${isActive 
                ? 'bg-gradient-to-r from-platform-950 via-platform-600 to-platform-400 text-white shadow-xl shadow-platform-600/25' 
                : 'text-gray-300 hover:bg-gradient-to-r hover:from-gray-700/60 hover:to-gray-700/40 hover:text-white hover:shadow-lg hover:translate-x-1'
              }
            `}
          >
            <span className={`flex-shrink-0 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
              {typeof item.icon === 'string' ? iconMap[item.icon] || item.icon : item.icon}
            </span>
            <span className="font-medium text-sm tracking-wide flex-1">{item.label}</span>
            {isActive && (
              <>
                <span className="absolute right-4 w-2 h-2 bg-white rounded-full animate-pulse shadow-lg"></span>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg"></div>
              </>
            )}
            {!isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            )}
          </Link>
        )}
      </li>
    );
  };

  return (
    <aside className="w-72 bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 text-white min-h-screen shadow-2xl border-r border-gray-700/30 backdrop-blur-sm">
      {/* Header avec design amélioré */}
      <div className="p-6 border-b border-gray-700/40 bg-gradient-to-r from-gray-800/80 via-gray-800/60 to-transparent backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-platform-600 to-platform-950 blur-md opacity-60 transition-opacity group-hover:opacity-80"></div>
            <div className="relative transform rounded-xl bg-gradient-to-br from-platform-800 via-platform-600 to-platform-400 p-2.5 shadow-lg transition-transform group-hover:scale-105">
              <FaGraduationCap className="text-xl text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="bg-gradient-to-r from-white via-platform-200 to-platform-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
              Navigation
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">Menu principal</p>
          </div>
        </div>
      </div>

      {/* Navigation avec scroll personnalisé */}
      <nav className="p-5 overflow-y-auto max-h-[calc(100vh-6.5rem)] custom-scrollbar">
        <ul className="space-y-2">
          {filteredItems.map((item) => renderItem(item))}
        </ul>
      </nav>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
