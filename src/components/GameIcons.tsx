import React from 'react';

export function TitleLockupSvg({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 620 190"
      className={className}
      role="img"
      aria-label="MARIO: MISSION ZAKAT HERO!"
    >
      <defs>
        <filter id="titleShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="0" floodColor="#1e293b" floodOpacity="0.88" />
        </filter>
      </defs>
      {/* Royal Crest Ribbon */}
      <g filter="url(#titleShadow)">
        <path
          d="M52 28 L568 28 Q588 28 584 48 L572 92 Q568 106 550 106 L70 106 Q52 106 48 92 L36 48 Q32 28 52 28 Z"
          fill="#ef4444"
          stroke="#1e293b"
          strokeWidth="6"
        />
        <path
          d="M66 38 L554 38 L544 96 L76 96 Z"
          fill="none"
          stroke="#fde047"
          strokeWidth="3"
          strokeDasharray="10 6"
        />
        {/* Crown + Coin emblem */}
        <circle cx="310" cy="24" r="22" fill="#facc15" stroke="#1e293b" strokeWidth="5" />
        <path d="M300 28 L304 16 L310 22 L316 16 L320 28 Z" fill="#b45309" />
      </g>
      <text
        x="310"
        y="78"
        textAnchor="middle"
        fill="#ffffff"
        stroke="#1e293b"
        strokeWidth="7"
        paintOrder="stroke fill"
        fontFamily="Bricolage Grotesque, sans-serif"
        fontWeight="800"
        fontSize="40"
        letterSpacing="2"
      >
        MARIO: MISSION
      </text>
      <g filter="url(#titleShadow)">
        <rect x="86" y="110" width="448" height="62" rx="18" fill="#facc15" stroke="#1e293b" strokeWidth="6" />
      </g>
      <text
        x="310"
        y="153"
        textAnchor="middle"
        fill="#1e293b"
        fontFamily="Bricolage Grotesque, sans-serif"
        fontWeight="800"
        fontSize="42"
        letterSpacing="2"
      >
        ZAKAT HERO!
      </text>
    </svg>
  );
}

export function CoinSvg({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#facc15" stroke="#78350f" strokeWidth="2.2" />
      <circle cx="12" cy="12" r="6.8" fill="#fde047" stroke="#b45309" strokeWidth="1.4" />
      <rect x="10.7" y="7.5" width="2.6" height="9" rx="1.2" fill="#b45309" />
    </svg>
  );
}

export function StarSvg({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2.5 L14.9 8.6 L21.6 9.5 L16.7 14.2 L17.9 20.9 L12 17.7 L6.1 20.9 L7.3 14.2 L2.4 9.5 L9.1 8.6 Z"
        fill="#38bdf8"
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 5.2 L13.4 9 L11.5 11.5 L9.4 9.6 Z" fill="#e0f2fe" />
    </svg>
  );
}

export function BadgeEmblemSvg({
  color,
  unlocked,
  className = 'w-12 h-12',
}: {
  color: string;
  unlocked: boolean;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M24 4 L40 10 V23 C40 33 33 41 24 44 C15 41 8 33 8 23 V10 Z"
        fill={unlocked ? color : '#cbd5e1'}
        stroke="#0f172a"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M24 12 L27.3 19 L35 20 L29.4 25.3 L30.8 33 L24 29.3 L17.2 33 L18.6 25.3 L13 20 L20.7 19 Z"
        fill={unlocked ? '#fef08a' : '#94a3b8'}
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SoundIconSvg({ muted, className = 'w-5 h-5' }: { muted: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
      {muted ? (
        <>
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </>
      ) : (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M19 5a10 10 0 0 1 0 14" />
        </>
      )}
    </svg>
  );
}

export function CharacterAvatarSvg({
  character,
  className = 'w-14 h-14',
}: {
  character: 'hero' | 'princess' | 'toad' | 'buddy' | 'dragon';
  className?: string;
}) {
  if (character === 'princess') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <circle cx="32" cy="34" r="24" fill="#ffe4e6" stroke="#1e293b" strokeWidth="3" />
        <path d="M16 24 L22 10 L32 18 L42 10 L48 24 Z" fill="#facc15" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="32" cy="18" r="3" fill="#0ea5e9" />
        <circle cx="24" cy="35" r="3.2" fill="#1e293b" />
        <circle cx="40" cy="35" r="3.2" fill="#1e293b" />
        <path d="M26 43 Q32 48 38 43" fill="none" stroke="#be123c" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (character === 'toad') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <ellipse cx="32" cy="24" rx="25" ry="17" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" />
        <circle cx="20" cy="20" r="6" fill="#059669" />
        <circle cx="44" cy="20" r="6" fill="#059669" />
        <circle cx="32" cy="14" r="5" fill="#059669" />
        <circle cx="32" cy="40" r="16" fill="#fef3c7" stroke="#1e293b" strokeWidth="3" />
        <circle cx="26" cy="39" r="4" fill="none" stroke="#b45309" strokeWidth="2.2" />
        <circle cx="38" cy="39" r="4" fill="none" stroke="#b45309" strokeWidth="2.2" />
        <circle cx="26" cy="39" r="2" fill="#1e293b" />
        <circle cx="38" cy="39" r="2" fill="#1e293b" />
        <path d="M28 46 Q32 49 36 46" fill="none" stroke="#1e293b" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (character === 'dragon') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path d="M16 18 L10 6 L24 14 Z" fill="#fef3c7" stroke="#1e293b" strokeWidth="2.5" />
        <path d="M48 18 L54 6 L40 14 Z" fill="#fef3c7" stroke="#1e293b" strokeWidth="2.5" />
        <circle cx="32" cy="35" r="20" fill="#6d28d9" stroke="#1e293b" strokeWidth="3" />
        <circle cx="24" cy="32" r="4" fill="#fde047" />
        <circle cx="40" cy="32" r="4" fill="#fde047" />
        <circle cx="24" cy="32" r="1.8" fill="#1e293b" />
        <circle cx="40" cy="32" r="1.8" fill="#1e293b" />
        <rect x="20" y="40" width="24" height="10" rx="5" fill="#fbbf24" stroke="#1e293b" strokeWidth="2.5" />
      </svg>
    );
  }
  if (character === 'buddy') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <circle cx="32" cy="37" r="18" fill="#fdd5b1" stroke="#1e293b" strokeWidth="3" />
        <path d="M12 28 Q32 10 52 28 Z" fill="#16a34a" stroke="#1e293b" strokeWidth="3" />
        <circle cx="32" cy="21" r="4.5" fill="#facc15" stroke="#1e293b" strokeWidth="2" />
        <circle cx="25" cy="37" r="2.8" fill="#1e293b" />
        <circle cx="39" cy="37" r="2.8" fill="#1e293b" />
        <path d="M26 44 Q32 49 38 44" fill="none" stroke="#7c2d12" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {/* Head + Red shirt collar & Blue overalls straps peek */}
      <path d="M14 58 C14 48 50 48 50 58 Z" fill="#ef4444" stroke="#1e293b" strokeWidth="2.6" />
      <rect x="20" y="50" width="7" height="9" rx="2" fill="#1d4ed8" stroke="#1e293b" strokeWidth="1.8" />
      <rect x="37" y="50" width="7" height="9" rx="2" fill="#1d4ed8" stroke="#1e293b" strokeWidth="1.8" />
      <circle cx="23.5" cy="54.5" r="2" fill="#facc15" />
      <circle cx="40.5" cy="54.5" r="2" fill="#facc15" />
      <circle cx="32" cy="37" r="17" fill="#fdd5b1" stroke="#1e293b" strokeWidth="2.8" />
      {/* Kopyah hitam + trim emas */}
      <path d="M14 27 L17 11 Q32 7 47 11 L50 27 Z" fill="#111827" stroke="#1e293b" strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M14 25 H50" stroke="#facc15" strokeWidth="2.6" />
      <circle cx="32" cy="18" r="3" fill="#facc15" />
      {/* Eyes, big nose, bushy mustache */}
      <circle cx="25" cy="34" r="2.7" fill="#1e293b" />
      <circle cx="39" cy="34" r="2.7" fill="#1e293b" />
      <circle cx="32" cy="39" r="4.5" fill="#f4b28a" stroke="#7c2d12" strokeWidth="1.5" />
      <path d="M21 44 Q26 41 32 44 Q38 41 43 44 Q38 48 32 46 Q26 48 21 44 Z" fill="#3b1f0e" />
    </svg>
  );
}
