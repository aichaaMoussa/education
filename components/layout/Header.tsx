import React from 'react';
import Link from 'next/link';
import { FiUser, FiLogOut, FiBook, FiBarChart2, FiSettings } from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';

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
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <FaGraduationCap className="text-2xl text-blue-600" />
            <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Easy Tech
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
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
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <FiUser className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="hidden md:block text-sm">
                    <p className="text-gray-700 font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
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
                  className="px-4 py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
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
