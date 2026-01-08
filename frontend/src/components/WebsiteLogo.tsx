import React, { useState, useEffect } from 'react';

interface WebsiteLogoProps {
  size?: 'navbar' | 'auth' | 'large' | 'custom';
  width?: number;
  height?: number;
  className?: string;
}

const WebsiteLogo: React.FC<WebsiteLogoProps> = ({ size = 'auth', width, height, className = '' }) => {
  const [logoPath, setLogoPath] = useState('/WebsiteLogo.svg');
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

  useEffect(() => {
    // Check if we're in a GitHub Pages environment
    const isGitHubPages = window.location.hostname.includes('github.io');
    const hasRepoPath = window.location.pathname.startsWith('/Hackathon-2-Five-Phases');

    if (isGitHubPages && hasRepoPath) {
      setLogoPath('/Hackathon-2-Five-Phases/WebsiteLogo.svg');
    } else {
      setLogoPath('/WebsiteLogo.svg');
    }
  }, []);

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logoPath}
        alt="AIDO Logo"
        width={logoWidth}
        height={logoHeight}
        className="object-contain max-h-full max-w-full"
        style={{ width: logoWidth, height: logoHeight }}
        onError={(e) => {
          // Fallback to alternative path if the primary path fails
          const target = e.target as HTMLImageElement;
          if (!target.src.endsWith('/Hackathon-2-Five-Phases/WebsiteLogo.svg')) {
            target.src = '/Hackathon-2-Five-Phases/WebsiteLogo.svg';
          }
        }}
      />
    </div>
  );
};

export default WebsiteLogo;