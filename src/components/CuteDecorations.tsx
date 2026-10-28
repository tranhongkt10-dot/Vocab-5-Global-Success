import React from 'react';

export const MascotAvatar: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-sm ${className}`}
      aria-label="Global Success Mascot"
    >
      {/* Background circle badge */}
      <circle cx="50" cy="50" r="46" fill="#FCE7F3" stroke="#EC4899" strokeWidth="2.5" />
      
      {/* Owl body */}
      <ellipse cx="50" cy="58" rx="28" ry="26" fill="#1E3A8A" />
      <ellipse cx="50" cy="62" rx="20" ry="18" fill="#FFFFFF" />

      {/* Graduation cap */}
      <polygon points="50,14 18,27 50,38 82,27" fill="#1E3A8A" stroke="#172554" strokeWidth="2" />
      <rect x="36" y="30" width="28" height="9" rx="3" fill="#1E3A8A" />
      <circle cx="50" cy="26" r="3.5" fill="#EC4899" />
      <path d="M50 26 C68 28 72 38 72 44" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="72" cy="46" r="3" fill="#F59E0B" />

      {/* Eyes & Round spectacles */}
      <circle cx="38" cy="50" r="10" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
      <circle cx="62" cy="50" r="10" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
      <line x1="48" y1="50" x2="52" y2="50" stroke="#3B82F6" strokeWidth="2" />

      {/* Pupils */}
      <circle cx="40" cy="50" r="5" fill="#1E293B" />
      <circle cx="42" cy="48" r="1.8" fill="#FFFFFF" />
      <circle cx="60" cy="50" r="5" fill="#1E293B" />
      <circle cx="62" cy="48" r="1.8" fill="#FFFFFF" />

      {/* Cute orange beak */}
      <polygon points="50,56 45,61 55,61" fill="#F97316" />

      {/* Blush pink cheeks */}
      <circle cx="27" cy="58" r="4.5" fill="#F472B6" opacity="0.75" />
      <circle cx="73" cy="58" r="4.5" fill="#F472B6" opacity="0.75" />

      {/* Small wings holding book */}
      <ellipse cx="26" cy="64" rx="7" ry="12" fill="#1E3A8A" transform="rotate(18 26 64)" />
      <ellipse cx="74" cy="64" rx="7" ry="12" fill="#1E3A8A" transform="rotate(-18 74 64)" />

      {/* Little red ribbon/tie */}
      <polygon points="50,68 45,77 55,77" fill="#EC4899" />
    </svg>
  );
};

export const CuteBookIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 text-indigo-500' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 2H6c-1.2 0-2.4.6-3 1.7A2 2 0 0 0 2 5v14c0 1.1.9 2 2 2h15a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-1 17H6c-.6 0-1-.4-1-1s.4-1 1-1h12v2zm0-4H6c-1.7 0-3 1.3-3 3V5c0-.6.4-1 1-1h14v11z"/>
  </svg>
);

export const CuteLeafIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 text-emerald-500' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.75C6 7.5 4.5 9 4 11c1.5-1.5 4-2 7-2 4 0 6 1 6 1z"/>
  </svg>
);

export const CuteCloudIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6 text-sky-400' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
  </svg>
);

export const CuteFlowerIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 text-pink-500' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="12" r="3" fill="#F59E0B" />
    <circle cx="12" cy="6" r="3" fill="#EC4899" />
    <circle cx="12" cy="18" r="3" fill="#EC4899" />
    <circle cx="6" cy="12" r="3" fill="#EC4899" />
    <circle cx="18" cy="12" r="3" fill="#EC4899" />
  </svg>
);
