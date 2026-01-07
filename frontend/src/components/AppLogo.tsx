import React from 'react';
import { LOGO_SIZES } from '@/lib/constants';

interface AppLogoProps {
  size?: 'navbar' | 'auth' | 'custom';
  width?: number;
  height?: number;
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ size = 'navbar', width, height, className = '' }) => {
  let logoWidth: number;
  let logoHeight: number;

  switch (size) {
    case 'navbar':
      logoHeight = LOGO_SIZES.NAVBAR;
      logoWidth = LOGO_SIZES.NAVBAR;
      break;
    case 'auth':
      logoHeight = LOGO_SIZES.AUTH;
      logoWidth = LOGO_SIZES.AUTH;
      break;
    case 'custom':
      logoWidth = width || 32;
      logoHeight = height || 32;
      break;
    default:
      logoHeight = LOGO_SIZES.NAVBAR;
      logoWidth = LOGO_SIZES.NAVBAR;
  }

  // SVG logo component
  const AIDOLogo = () => (
    <svg
      width={logoWidth}
      height={logoHeight}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="object-contain"
    >
      {/* AIDO Logo - stylized "A" and "T" */}
      <rect x="2" y="6" width="4" height="20" rx="1" fill="#0ea5e9" />
      <rect x="8" y="6" width="4" height="20" rx="1" fill="#0ea5e9" />
      <rect x="6" y="10" width="8" height="4" rx="1" fill="#0ea5e9" />

      <rect x="18" y="6" width="4" height="20" rx="1" fill="#22c55e" />
      <rect x="16" y="8" width="8" height="4" rx="1" fill="#22c55e" />
      <rect x="16" y="14" width="8" height="4" rx="1" fill="#22c55e" />
      <rect x="16" y="20" width="8" height="4" rx="1" fill="#22c55e" />
    </svg>
  );

  return (
    <div className={className}>
      <AIDOLogo />
    </div>
  );
};

export default AppLogo;