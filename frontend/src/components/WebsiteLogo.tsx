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
      logoWidth = 300;  // Larger size for auth pages (increased from 200)
      logoHeight = 90;  // Maintain aspect ratio (increased from 60)
      break;
    case 'large':
      logoWidth = 400;  // Large size for landing pages (increased from 300)
      logoHeight = 120;  // Maintain aspect ratio (increased from 90)
      break;
    case 'custom':
      logoWidth = width || 300;
      logoHeight = height || 90;
      break;
    default:
      logoWidth = 300;
      logoHeight = 90;
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

  // For auth pages, center the logo by adding justify-center to the container
  const containerClass = size === 'auth'
    ? `flex items-center justify-center ${className}`
    : `flex items-center ${className}`;

  return (
    <div className={containerClass}>
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