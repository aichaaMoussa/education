import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/** Logo itkane depuis `public/images/logo-itkane.png` */
const LOGO_SRC = '/images/logo-itkane (1).png';

const Logo: React.FC<LogoProps> = ({
  className = '',
  showText = false,
  size = 'md',
}) => {
  const heightClass = {
    sm: 'h-16 sm:h-20',
    md: 'h-20 sm:h-24 md:h-28',
    lg: 'h-28 sm:h-32 md:h-36',
  }[size];

  const maxW = {
    sm: 'max-w-[min(100%,340px)]',
    md: 'max-w-[min(100%,420px)]',
    lg: 'max-w-[min(100%,520px)]',
  }[size];

  const textSizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
  };

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 group ${className}`}
    >
      <Image
        src={LOGO_SRC}
        alt="itkane"
        width={520}
        height={128}
        className={`${heightClass} w-auto ${maxW} object-contain object-left shrink-0`}
        sizes="(max-width: 640px) 300px, (max-width: 1024px) 380px, 440px"
        priority
      />
      {showText && (
        <span
          className={`${textSizes[size]} font-bold bg-gradient-to-r from-platform-800 via-platform-600 to-platform-400 bg-clip-text text-transparent group-hover:from-platform-950 group-hover:to-platform-200 transition-all duration-300`}
        >
          itkane
        </span>
      )}
    </Link>
  );
};

export default Logo;
