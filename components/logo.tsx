export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className={`${className} rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center`}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[60%] h-[60%]"
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
  );
}