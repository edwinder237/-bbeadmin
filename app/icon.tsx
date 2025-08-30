import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main document */}
          <path
            d="M8 2H16C17.1046 2 18 2.89543 18 4V20C18 21.1046 17.1046 22 16 22H8C6.89543 22 6 21.1046 6 20V4C6 2.89543 6.89543 2 8 2Z"
            fill="white"
            fillOpacity="0.95"
          />
          {/* Smaller document behind */}
          <path
            d="M10 1H18C19.1046 1 20 1.89543 20 3V19C20 20.1046 19.1046 21 18 21H17V4C17 2.89543 16.1046 2 15 2H10V1Z"
            fill="white"
            fillOpacity="0.7"
          />
          {/* Document lines */}
          <line
            x1="9"
            y1="7"
            x2="15"
            y2="7"
            stroke="#4F46E5"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <line
            x1="9"
            y1="10"
            x2="15"
            y2="10"
            stroke="#4F46E5"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <line
            x1="9"
            y1="13"
            x2="13"
            y2="13"
            stroke="#4F46E5"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}