import React from 'react';

interface WebsiteLogoProps {
  size?: 'navbar' | 'auth' | 'large' | 'custom';
  width?: number;
  height?: number;
  className?: string;
}

const WebsiteLogo: React.FC<WebsiteLogoProps> = ({ size = 'auth', width, height, className = '' }) => {
  let logoWidth: number;
  let logoHeight: number;

  switch (size) {
    case 'navbar':
      logoWidth = 120;  // Appropriate width for navbar
      logoHeight = 40;  // Maintain aspect ratio
      break;
    case 'auth':
      logoWidth = 200;  // Larger size for auth pages
      logoHeight = 60;  // Maintain aspect ratio
      break;
    case 'large':
      logoWidth = 300;  // Large size for landing pages
      logoHeight = 90;  // Maintain aspect ratio
      break;
    case 'custom':
      logoWidth = width || 200;
      logoHeight = height || 60;
      break;
    default:
      logoWidth = 200;
      logoHeight = 60;
  }

  // For GitHub Pages deployment, the image path needs to include the repository name
  // when deployed to a subdirectory like https://username.github.io/repository-name/
  const logoPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/Hackathon-2-Five-Phases')
    ? '/Hackathon-2-Five-Phases/WebsiteLogo.svg'
    : '/WebsiteLogo.svg';

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logoPath}
        alt="AIDO Logo"
        width={logoWidth}
        height={logoHeight}
        className="object-contain max-h-full max-w-full"
        style={{ width: logoWidth, height: logoHeight }}
      />
    </div>
  );
};

export default WebsiteLogo;