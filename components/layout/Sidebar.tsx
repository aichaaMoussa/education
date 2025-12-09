import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FiHome, FiBook, FiUsers, FiSettings, FiCheckCircle, 
  FiBarChart2, FiPlus, FiShoppingCart, FiTrendingUp,
  FiShield, FiUserCheck
} from 'react-icons/fi';
import { FaGraduationCap, FaChalkboardTeacher } from 'react-icons/fa';

type SidebarItem = {
  label: string;
  href: string;
  icon: JSX.Element;
  permission?: (typeof Permissions)[keyof typeof Permissions];
};

interface SidebarProps {
  items: SidebarItem[];
  userPermissions?: string[];
}

const iconMap: { [key: string]: React.ReactNode } = {
  '📊': <FiBarChart2 className="w-5 h-5" />,
  '📚': <FiBook className="w-5 h-5" />,
  '👥': <FiUsers className="w-5 h-5" />,
  '🔐': <FiShield className="w-5 h-5" />,
  '➕': <FiPlus className="w-5 h-5" />,
  '✅': <FiCheckCircle className="w-5 h-5" />,
  '📈': <FiBarChart2 className="w-5 h-5" />,
  '👨‍🏫': <FaChalkboardTeacher className="w-5 h-5" />,
  '🛒': <FiShoppingCart className="w-5 h-5" />,
  '📖': <FiBook className="w-5 h-5" />,
};

const Sidebar: React.FC<SidebarProps> = ({ items, userPermissions = [] }) => {
  const router = useRouter();

  const filteredItems = items.filter(item => {
    if (!item.permission) return true;
    return userPermissions.includes(item.permission);
  });

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
          {filteredItems.map((item) => {
            const isActive = router.pathname === item.href || router.pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <span className="flex-shrink-0">
                    {typeof item.icon === 'string' ? iconMap[item.icon] || item.icon : item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
