import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FiHome, FiBook, FiUsers, FiSettings, FiCheckCircle, 
  FiBarChart2, FiPlus, FiShoppingCart, FiTrendingUp,
  FiShield, FiUserCheck, FiChevronDown, FiChevronRight
} from 'react-icons/fi';
import { FaGraduationCap, FaChalkboardTeacher } from 'react-icons/fa';
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
      <li key={item.label} className={level > 0 ? 'ml-4' : ''}>
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleExpand(item.label)}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
                ${isActive || hasActiveChild
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="flex-shrink-0">
                  {typeof item.icon === 'string' ? iconMap[item.icon] || item.icon : item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </div>
              {isExpanded ? (
                <FiChevronDown className="w-4 h-4" />
              ) : (
                <FiChevronRight className="w-4 h-4" />
              )}
            </button>
            {isExpanded && (
              <ul className="mt-1 space-y-1">
                {item.children!.map(child => renderItem(child, level + 1))}
              </ul>
            )}
          </>
        ) : (
          <Link
            href={item.href || '#'}
            className={`
              flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
              ${isActive 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }
            `}
          >
            <span className="flex-shrink-0">
              {typeof item.icon === 'string' ? iconMap[item.icon] || item.icon : item.icon}
            </span>
            <span className="font-medium">{item.label}</span>
          </Link>
        )}
      </li>
    );
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white min-h-screen shadow-lg">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <FaGraduationCap className="text-2xl text-blue-400" />
          <span className="text-lg font-bold">Menu</span>
        </div>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {filteredItems.map((item) => renderItem(item))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
