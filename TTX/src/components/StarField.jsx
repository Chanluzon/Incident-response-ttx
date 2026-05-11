import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

const StarField = () => {
  const { isLightMode } = useTheme();

  const stars = useMemo(() => {
    const colors = isLightMode 
      ? ['#3b82f6', '#2563eb', '#60a5fa', '#1d4ed8', '#1e40af'] // Vibrant Blue stars for light mode
      : ['#ffffff', '#bfdbfe', '#fef9c3', '#fed7aa', '#fecca3']; // Bright stars for dark mode

    return Array.from({ length: 250 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1.2, // Slightly larger base size
      delay: Math.random() * 10,
      duration: Math.random() * 4 + 3,
      opacity: isLightMode ? Math.random() * 0.4 + 0.4 : Math.random() * 0.4 + 0.6, // Higher opacity (0.4 - 0.8)
      color: colors[Math.floor(Math.random() * colors.length)],
      z: Math.floor(Math.random() * 3),
    }));
  }, [isLightMode]);

  const distantGalaxies = useMemo(() => {
    const colors = isLightMode
      ? ['rgba(59, 130, 246, 0.05)', 'rgba(148, 163, 184, 0.05)', 'rgba(203, 213, 225, 0.05)']
      : ['rgba(139, 92, 246, 0.1)', 'rgba(59, 130, 246, 0.1)', 'rgba(236, 72, 153, 0.1)'];

    return Array.from({ length: 8 }).map((_, i) => ({
      id: `galaxy-${i}`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 300 + 200,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
    }));
  }, [isLightMode]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Distant Galaxies / Nebulae */}
      {distantGalaxies.map((g) => (
        <div
          key={g.id}
          className="absolute rounded-full blur-[80px] mix-blend-multiply opacity-50"
          style={{
            top: g.top,
            left: g.left,
            width: `${g.size}px`,
            height: `${g.size}px`,
            backgroundColor: g.color,
            transform: `rotate(${g.rotation}deg)`,
          }}
        />
      ))}

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className={`absolute rounded-full animate-twinkle ${star.z === 0 ? 'opacity-40' : star.z === 1 ? 'opacity-70' : 'opacity-100'}`}
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            boxShadow: !isLightMode && star.size > 1.2 ? `0 0 12px 1px ${star.color}` : 'none',
          }}
        />
      ))}
    </div>
  );
};

export default StarField;
