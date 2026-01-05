import React from 'react';
import Image from 'next/image';
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

  return (
    <div className={className}>
      <Image
        src="/WebsiteLogo.png"
        alt="AIDO Logo"
        width={logoWidth}
        height={logoHeight}
        className="object-contain"
      />
    </div>
  );
};

export default AppLogo;