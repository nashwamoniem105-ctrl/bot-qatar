import React from "react";

export function CarIcon({ active }: { active?: boolean }) {
  const color = active ? "#003E66" : "#A0AEC0";
  return (
    <svg viewBox="0 0 100 100" className="w-14 h-14" xmlns="http://www.w3.org/2000/svg">
      {/* Car Body */}
      <path d="M20 50 Q20 42 30 42 L70 42 Q80 42 80 50 L80 65 Q80 68 75 68 L25 68 Q20 68 20 65 Z" fill="none" stroke={color} strokeWidth="2" />
      {/* Roof */}
      <path d="M32 42 L38 32 Q40 28 48 28 L52 28 Q60 28 62 32 L68 42" fill="none" stroke={color} strokeWidth="2" />
      {/* Wheels */}
      <circle cx="32" cy="68" r="5" fill="white" stroke={color} strokeWidth="2" />
      <circle cx="68" cy="68" r="5" fill="white" stroke={color} strokeWidth="2" />
      {/* Lights */}
      <rect x="25" y="52" width="8" height="4" rx="1" fill="none" stroke={color} strokeWidth="1.5" />
      <rect x="67" y="52" width="8" height="4" rx="1" fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function PersonIcon({ active }: { active?: boolean }) {
  const color = active ? "#003E66" : "#A0AEC0";
  return (
    <svg viewBox="0 0 100 100" className="w-14 h-14" xmlns="http://www.w3.org/2000/svg">
      {/* Ghutra Outline */}
      <path d="M30 35 Q50 15 70 35 L75 50 Q75 60 65 65 L65 80 L35 80 L35 65 Q25 60 25 50 Z" fill="none" stroke={color} strokeWidth="2" />
      {/* Face */}
      <path d="M42 45 Q50 52 58 45" fill="none" stroke={color} strokeWidth="1.5" />
      {/* Shoulders */}
      <path d="M35 80 L25 90 M65 80 L75 90" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function BuildingIcon({ active }: { active?: boolean }) {
  const color = active ? "#003E66" : "#A0AEC0";
  return (
    <svg viewBox="0 0 100 100" className="w-14 h-14" xmlns="http://www.w3.org/2000/svg">
      {/* Building Body */}
      <rect x="25" y="35" width="50" height="45" rx="2" fill="none" stroke={color} strokeWidth="2" />
      {/* Roof Details */}
      <path d="M35 35 L35 25 L45 25 L45 35 M55 35 L55 25 L65 25 L65 35" fill="none" stroke={color} strokeWidth="2" />
      {/* Windows */}
      <rect x="35" y="45" width="10" height="10" rx="1" fill="none" stroke={color} strokeWidth="1.5" />
      <rect x="55" y="45" width="10" height="10" rx="1" fill="none" stroke={color} strokeWidth="1.5" />
      {/* Door */}
      <rect x="44" y="65" width="12" height="15" fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}
