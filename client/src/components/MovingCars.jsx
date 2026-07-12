import { useEffect, useState } from 'react';

// Premium SVG Car illustrations — sleek, modern, cinematic
const SportsCarSVG = ({ accentColor }) => (
  <svg viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    {/* Body Shadow/Underglow */}
    <ellipse cx="80" cy="46" rx="65" ry="4" fill={accentColor} opacity="0.3" />
    {/* Main Body - Stealth Dark */}
    <path d="M15 36 C10 36, 12 25, 30 20 L55 14 C65 11, 85 10, 105 13 L145 22 C152 24, 155 30, 155 36 L15 36 Z" fill="var(--text-primary)"/>
    {/* Highlight/Reflection */}
    <path d="M25 22 C35 18, 55 13, 85 12 L125 16 C110 18, 70 20, 25 22 Z" fill="#ffffff" opacity="0.05"/>
    {/* Cockpit / Glass */}
    <path d="M40 20 C40 18, 55 8, 80 8 C100 8, 115 14, 120 22 C100 20, 60 18, 40 20 Z" fill="#050508"/>
    <path d="M85 8 C95 8, 105 12, 110 18" stroke="#ffffff" strokeWidth="1" opacity="0.1"/>
    {/* Wheels */}
    <circle cx="35" cy="36" r="9" fill="#050508" stroke="#1a1a24" strokeWidth="2"/>
    <circle cx="35" cy="36" r="4" fill={accentColor} opacity="0.5"/>
    <circle cx="125" cy="36" r="9" fill="#050508" stroke="#1a1a24" strokeWidth="2"/>
    <circle cx="125" cy="36" r="4" fill={accentColor} opacity="0.5"/>
    {/* Headlights (Aggressive Angle) */}
    <path d="M140 24 L152 26 L148 29 Z" fill="#ffffff" filter="drop-shadow(0 0 4px #fff)"/>
    <path d="M142 25 L155 27" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" filter="drop-shadow(0 0 6px #fff)"/>
    {/* Taillights (Cyberpunk Strip) */}
    <path d="M12 26 L16 26" stroke="#ff1a1a" strokeWidth="3" strokeLinecap="round" filter="drop-shadow(0 0 5px #ff1a1a)"/>
    {/* Accent lines */}
    <path d="M45 28 L110 28" stroke={accentColor} strokeWidth="1" opacity="0.4"/>
  </svg>
);

const ModernSUVSVG = ({ accentColor }) => (
  <svg viewBox="0 0 170 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    {/* Underglow */}
    <ellipse cx="85" cy="55" rx="70" ry="5" fill={accentColor} opacity="0.3" />
    {/* Main Body - Stealth */}
    <path d="M10 46 C10 40, 12 25, 25 24 L55 22 C65 20, 105 20, 125 23 L155 28 C162 30, 165 38, 165 46 L10 46 Z" fill="var(--text-primary)"/>
    {/* Side detailing */}
    <path d="M25 32 C45 28, 95 28, 145 34" stroke="#ffffff" strokeWidth="1" opacity="0.04"/>
    {/* Cabin / Windows */}
    <path d="M30 24 C30 20, 35 10, 55 8 L105 8 C120 8, 130 15, 135 24 C100 24, 60 23, 30 24 Z" fill="#08080a"/>
    {/* Window Pillars */}
    <rect x="65" y="8" width="4" height="15" fill="#121217"/>
    <rect x="100" y="8" width="5" height="16" fill="#121217"/>
    {/* Wheels - Chunky */}
    <circle cx="35" cy="46" r="11" fill="#050505" stroke="#222" strokeWidth="2.5"/>
    <circle cx="35" cy="46" r="5" fill="#1a1a24"/>
    <circle cx="135" cy="46" r="11" fill="#050505" stroke="#222" strokeWidth="2.5"/>
    <circle cx="135" cy="46" r="5" fill="#1a1a24"/>
    {/* Headlights - DRL strip */}
    <path d="M150 29 L162 31" stroke="#e0f2fe" strokeWidth="2.5" strokeLinecap="round" filter="drop-shadow(0 0 4px #bae6fd)"/>
    <circle cx="152" cy="33" r="1.5" fill="#fff" filter="drop-shadow(0 0 3px #fff)"/>
    {/* Taillights */}
    <path d="M10 30 L15 30" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" filter="drop-shadow(0 0 6px #ef4444)"/>
    {/* Subtle lower trim */}
    <rect x="50" y="42" width="70" height="2" rx="1" fill={accentColor} opacity="0.3"/>
  </svg>
);

const HypercarSVG = ({ accentColor }) => (
  <svg viewBox="0 0 170 45" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    {/* Underglow - Stronger for hypercar */}
    <ellipse cx="85" cy="42" rx="75" ry="3" fill={accentColor} opacity="0.4" />
    {/* Main Body */}
    <path d="M12 34 C10 32, 12 24, 30 18 L60 14 C80 12, 110 12, 130 16 L160 26 C165 28, 168 32, 168 36 C168 38, 166 40, 160 40 L12 40 C8 40, 6 36, 12 34 Z" fill="var(--text-primary)"/>
    <path d="M60 14 C80 12, 110 12, 130 16 L160 26 C140 22, 90 18, 60 14 Z" fill="#ffffff" opacity="0.03"/>
    {/* Canopy */}
    <path d="M45 16 C50 12, 65 6, 85 6 C105 6, 120 10, 125 15 C100 13, 70 12, 45 16 Z" fill="#030305"/>
    <path d="M85 6 C100 6, 115 9, 120 14" stroke="#ffffff" strokeWidth="1" opacity="0.15"/>
    {/* Wheels - Large, aero discs */}
    <circle cx="38" cy="35" r="10" fill="#000" stroke="#333" strokeWidth="1"/>
    <circle cx="38" cy="35" r="7" fill="#111" stroke={accentColor} strokeWidth="0.5" opacity="0.7"/>
    <circle cx="138" cy="35" r="10" fill="#000" stroke="#333" strokeWidth="1"/>
    <circle cx="138" cy="35" r="7" fill="#111" stroke={accentColor} strokeWidth="0.5" opacity="0.7"/>
    {/* Headlights - Laser styling */}
    <path d="M145 26 L162 30" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" filter="drop-shadow(0 0 6px #0ea5e9)"/>
    <path d="M142 28 L155 31" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
    {/* Taillights - Integrated spoiler strip */}
    <path d="M12 24 L22 21" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" filter="drop-shadow(0 0 8px #e11d48)"/>
    {/* Side aero vent */}
    <path d="M80 28 L110 24 L105 32 Z" fill="#050505"/>
    <path d="M80 28 L110 24" stroke={accentColor} strokeWidth="1" opacity="0.5" filter="drop-shadow(0 0 2px ${accentColor})"/>
  </svg>
);

const carComponents = [SportsCarSVG, ModernSUVSVG, HypercarSVG];
// Premium cinematic accent colors: neon red, electric blue, acid green, cyber purple, bright orange
const carColors = ['#ff2a4b', '#0ea5e9', '#22c55e', '#a855f7', '#f97316', '#eab308'];

const MovingCars = ({ count = 6 }) => {
  const [instances, setInstances] = useState([]);

  useEffect(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const isLarge = Math.random() > 0.7; // Some cars appear closer (larger)
      arr.push({
        id: i,
        CarComp: carComponents[i % carComponents.length],
        color: carColors[i % carColors.length],
        // Position them vertically, avoiding the absolute center if possible
        top: 5 + Math.random() * 85,
        duration: (isLarge ? 15 : 25) + Math.random() * 10, // Closer cars move faster
        delay: Math.random() * -40,
        direction: Math.random() > 0.5 ? 1 : -1,
        size: isLarge ? (200 + Math.random() * 50) : (100 + Math.random() * 60),
        opacity: isLarge ? 1 : 0.8,
        zIndex: isLarge ? 2 : 0, // Depth layering
      });
    }
    setInstances(arr);
  }, [count]);

  return (
    <div style={styles.container} aria-hidden="true">
      {instances.map((c) => {
        const CarComp = c.CarComp;
        return (
          <div
            key={c.id}
            style={{
              position: 'absolute',
              top: `${c.top}%`,
              width: `${c.size}px`,
              opacity: c.opacity,
              zIndex: c.zIndex,
              animation: `${c.direction > 0 ? 'carDriveRightPremium' : 'carDriveLeftPremium'} ${c.duration}s cubic-bezier(0.4, 0, 0.6, 1) ${c.delay}s infinite`,
              transform: c.direction < 0 ? 'scaleX(-1)' : 'none',
              willChange: 'transform',
            }}
          >
            <CarComp accentColor={c.color} />
          </div>
        );
      })}

      <style>{`
        @keyframes carDriveRightPremium {
          0%   { transform: translateX(-50vw); }
          100% { transform: translateX(150vw); }
        }
        @keyframes carDriveLeftPremium {
          0%   { transform: translateX(150vw) scaleX(-1); }
          100% { transform: translateX(-50vw) scaleX(-1); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
    overflow: 'hidden',
  },
};

export default MovingCars;
