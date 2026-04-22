import React from 'react';
import Link from 'next/link';
import { FiUser, FiLogOut, FiBook, FiBarChart2, FiSettings } from 'react-icons/fi';
import Logo from '../ui/Logo';

interface HeaderProps {
  user?: {
    firstName: string;
    lastName: string;
    role: {
      name: string;
    };
  };
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const getRoleLabel = (roleName: string) => {
    const labels: { [key: string]: string } = {
      admin: 'Administrateur',
      formateur: 'Formateur',
      apprenant: 'Apprenant',
      instructor: 'Formateur',
      student: 'Apprenant',
    };
    return labels[roleName] || roleName;
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50 w-full" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center min-h-[8rem] py-3 sm:min-h-[8.5rem]">
          <Logo size="md" />
          
          {/* <nav className="hidden md:flex items-center space-x-6">
            <Link href="/courses" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
              <FiBook className="w-4 h-4" />
              <span>Formations</span>
            </Link>
            {user && (
              <>
                <Link href="/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                  <FiBarChart2 className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                {user.role.name === 'admin' && (
                  <Link href="/admin/statistics" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                    <FiSettings className="w-4 h-4" />
                    <span>Administration</span>
                  </Link>
                )}
              </>
            )}
          </nav> */}

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-platform-400/15">
                    <FiUser className="h-4 w-4 text-platform-600" />
                  </div>
                  <div className="hidden md:block text-sm">
                    <p className="text-gray-700 font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <span className="rounded-full bg-platform-400/15 px-2 py-0.5 text-xs font-medium text-platform-950">
                      {getRoleLabel(user.role.name)}
                    </span>
                  </div>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-1 px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Déconnexion</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-gray-700 transition-colors hover:text-platform-600"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-platform-600 px-4 py-2 text-sm text-white shadow-sm transition-colors hover:bg-platform-800"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
