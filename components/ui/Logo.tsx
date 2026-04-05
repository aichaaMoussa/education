import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', showText = true, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <Link href="/" className={`flex items-center space-x-2 group ${className}`}>
      {/* Logo SVG personnalisé pour itkane */}
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 relative overflow-hidden`}>
        {/* Effet de brillance */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 p-2"
        >
          {/* Design moderne "itkane" - Lettre "i" avec point */}
          <circle cx="20" cy="8" r="2.5" fill="white" />
          {/* Barre verticale du "i" */}
          <rect x="18" y="12" width="4" height="16" rx="2" fill="white" />
          {/* Ligne courbe stylisée pour "tkane" */}
          <path
            d="M20 28 C22 28, 24 27, 26 26 C28 25, 30 23, 30 21 C30 19, 28 17, 26 17 C24 17, 22 18, 20 20"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Petite étoile décorative */}
          <path
            d="M28 14 L28.5 15.5 L30 15.5 L28.8 16.5 L29.2 18 L28 17 L26.8 18 L27.2 16.5 L26 15.5 L27.5 15.5 Z"
            fill="white"
            opacity="0.8"
          />
        </svg>
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-300`}>
          itkane
        </span>
      )}
    </Link>
  );
};

export default Logo;
