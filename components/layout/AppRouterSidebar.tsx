'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaGraduationCap } from 'react-icons/fa';
import { PERMISSIONS } from '@/lib/permissions';

type SidebarItem = {
  label: string;
  href?: string;
  icon: JSX.Element | string;
  permission?: (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
};

interface AppRouterSidebarProps {
  items: SidebarItem[];
  userPermissions?: (typeof PERMISSIONS)[keyof typeof PERMISSIONS][];
}

/**
 * Barre latérale pour routes App Router : utilise `usePathname` (`next/navigation`).
 * Pour les menus à un seul niveau (sans sous-menus imbriqués).
 */
const AppRouterSidebar: React.FC<AppRouterSidebarProps> = ({
  items,
  userPermissions = [],
}) => {
  const pathname = usePathname() || '';

  const filteredItems = items.filter((item) => {
    if (!item.permission) return true;
    return userPermissions.includes(item.permission);
  });

  return (
    <aside className="w-72 min-h-screen border-r border-gray-700/30 bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 text-white shadow-2xl backdrop-blur-sm">
      <div className="border-b border-gray-700/40 bg-gradient-to-r from-gray-800/80 via-gray-800/60 to-transparent p-6 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-platform-600 to-platform-950 opacity-60 blur-md transition-opacity group-hover:opacity-80" />
            <div className="relative rounded-xl bg-gradient-to-br from-platform-800 via-platform-600 to-platform-400 p-2.5 shadow-lg transition-transform group-hover:scale-105">
              <FaGraduationCap className="text-xl text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="bg-gradient-to-r from-white via-platform-200 to-platform-400 bg-clip-text text-lg font-bold tracking-tight text-transparent">
              Navigation
            </h2>
            <p className="mt-0.5 text-xs font-medium text-gray-400">Menu principal</p>
          </div>
        </div>
      </div>

      <nav className="max-h-[calc(100vh-6.5rem)] overflow-y-auto p-5">
        <ul className="space-y-2">
          {filteredItems.map((item) => {
            const href = item.href || '#';
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <li key={item.label}>
                <Link
                  href={href}
                  className={`group relative flex items-center space-x-4 overflow-hidden rounded-xl px-5 py-3.5 transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-platform-950 via-platform-600 to-platform-400 text-white shadow-xl shadow-platform-600/25'
                      : 'text-gray-300 hover:translate-x-1 hover:bg-gradient-to-r hover:from-gray-700/60 hover:to-gray-700/40 hover:text-white hover:shadow-lg'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 transition-all duration-300 ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1 text-sm font-medium tracking-wide">
                    {item.label}
                  </span>
                  {isActive && (
                    <>
                      <span className="absolute right-4 h-2 w-2 animate-pulse rounded-full bg-white shadow-lg" />
                      <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white shadow-lg" />
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default AppRouterSidebar;
