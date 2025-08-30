import React from 'react';

interface AppIconProps {
  size?: number;
  className?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        width="512"
        height="512"
        rx="120"
        fill="url(#gradient)"
      />
      <g transform="translate(128, 96)">
        <rect
          x="0"
          y="0"
          width="256"
          height="320"
          rx="16"
          fill="white"
          fillOpacity="0.95"
        />
        <rect
          x="48"
          y="80"
          width="160"
          height="8"
          rx="4"
          fill="#6B46C1"
        />
        <rect
          x="48"
          y="120"
          width="160"
          height="8"
          rx="4"
          fill="#6B46C1"
        />
        <rect
          x="48"
          y="160"
          width="160"
          height="8"
          rx="4"
          fill="#6B46C1"
        />
        <rect
          x="48"
          y="200"
          width="120"
          height="8"
          rx="4"
          fill="#6B46C1"
        />
        <rect
          x="48"
          y="240"
          width="140"
          height="8"
          rx="4"
          fill="#6B46C1"
        />
      </g>
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="512" y2="512">
          <stop offset="0%" stopColor="#6B46C1" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default AppIcon;