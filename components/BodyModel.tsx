import React from 'react';

// DÁNG NGƯỜI THAY ĐỔI THEO DỮ LIỆU:
// Người gầy -> thân nhỏ, vai nhỏ. Người vai rộng -> vai ngang rộng.
// Người mập (oval) -> bụng to, tròn.

interface BodyModelProps {
  silhouette?: string;
  className?: string; // Optional className for tailwind styling, defaults to full size container
}

export function BodyModel({ silhouette = 'rectangle', className = "w-full h-full" }: BodyModelProps) {
  // Normalize silhouette name
  const sil = silhouette.toLowerCase();
  
  let shoulders = 50;
  let waist = 45;
  let hips = 50;

  if (sil.includes('đồng hồ cát') || sil.includes('hourglass')) {
    shoulders = 55;
    waist = 35;
    hips = 55;
  } else if (sil.includes('tam giác ngược') || sil.includes('inverted')) {
    shoulders = 60;
    waist = 45;
    hips = 40;
  } else if (sil.includes('tam giác') || sil.includes('pear') || sil.includes('triangle')) {
    shoulders = 40;
    waist = 45;
    hips = 60;
  } else if (sil.includes('oval') || sil.includes('apple') || sil.includes('quả táo') || sil.includes('tròn')) {
    shoulders = 55;
    waist = 60;
    hips = 55;
  } else {
    // rectangle, slim
    shoulders = 48;
    waist = 45;
    hips = 48;
  }

  // Generate SVG path based on these measurements. We'll use a viewBox of 0 0 100 200.
  // We'll create a smooth path for the silhouette.

  // Left side points
  const leftShoulderX = 50 - shoulders / 2;
  const rightShoulderX = 50 + shoulders / 2;
  const shoulderY = 48;

  const leftWaistX = 50 - waist / 2;
  const rightWaistX = 50 + waist / 2;
  const waistY = 88;

  const leftHipX = 50 - hips / 2;
  const rightHipX = 50 + hips / 2;
  const hipY = 125;
  
  // Upper thighs/legs
  const leftLegEdgeX = 50 - hips / 2.5;
  const rightLegEdgeX = 50 + hips / 2.5;
  const crotchY = 145;
  const ankleY = 195;
  const ankleWidth = 8;
  
  const leftAnkleLeftX = 40 - ankleWidth/2;
  const leftAnkleRightX = 40 + ankleWidth/2;
  
  const rightAnkleLeftX = 60 - ankleWidth/2;
  const rightAnkleRightX = 60 + ankleWidth/2;

  // Neck
  const neckLeft = 46;
  const neckRight = 54;
  const neckTop = 32;

  const path = `
    M ${neckLeft} ${neckTop}
    C ${neckLeft} ${shoulderY - 8}, ${leftShoulderX + 8} ${shoulderY - 5}, ${leftShoulderX} ${shoulderY}
    C ${leftShoulderX - 3} ${shoulderY + 15}, ${leftWaistX} ${waistY - 15}, ${leftWaistX} ${waistY}
    C ${leftWaistX} ${waistY + 15}, ${leftHipX} ${hipY - 15}, ${leftHipX} ${hipY}
    C ${leftHipX} ${hipY + 15}, ${leftLegEdgeX} ${crotchY - 5}, ${leftAnkleLeftX} ${ankleY}
    L ${leftAnkleRightX} ${ankleY}
    C ${leftAnkleRightX + 2} ${ankleY - 20}, 48 ${crotchY + 10}, 50 ${crotchY}
    C 52 ${crotchY + 10}, ${rightAnkleLeftX - 2} ${ankleY - 20}, ${rightAnkleLeftX} ${ankleY}
    L ${rightAnkleRightX} ${ankleY}
    C ${rightLegEdgeX} ${crotchY - 5}, ${rightHipX} ${hipY + 15}, ${rightHipX} ${hipY}
    C ${rightHipX} ${hipY - 15}, ${rightWaistX} ${waistY + 15}, ${rightWaistX} ${waistY}
    C ${rightWaistX} ${waistY - 15}, ${rightShoulderX + 3} ${shoulderY + 15}, ${rightShoulderX} ${shoulderY}
    C ${rightShoulderX - 8} ${shoulderY - 5}, ${neckRight} ${shoulderY - 8}, ${neckRight} ${neckTop}
    Z
  `;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Luxury Glow Effect Behind the Statue */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[120%] h-[120%] bg-brand-gold/10 dark:bg-brand-gold/10 rounded-full blur-[40px] animate-pulse"></div>
        <div className="absolute w-[80%] h-[100%] bg-amber-500/10 dark:bg-amber-400/10 rounded-full blur-[30px] transform rotate-12"></div>
      </div>
      
      {/* SVG Silhouette Model */}
      <svg 
        viewBox="0 0 100 200" 
        className="relative z-10 w-full h-full text-brand-red dark:text-brand-gold drop-shadow-2xl transition-all duration-1000 ease-in-out"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.85" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.65" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.9" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <g filter="url(#glow)">
          {/* Head */}
          <circle cx="50" cy="20" r="10" fill="url(#bodyGradient)" />
          
          {/* Torso & Legs */}
          <path 
            d={path} 
            fill="url(#bodyGradient)" 
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.5"
            className="transition-all duration-1000 ease-in-out"
          />
          
          {/* Arms (Elegant hanging down) */}
          <path 
            d={`
              M ${leftShoulderX} ${shoulderY + 2}
              C ${leftShoulderX - 8} ${shoulderY + 15}, ${leftWaistX - 12} ${waistY + 10}, ${leftHipX - 10} ${hipY + 10}
              C ${leftHipX - 5} ${hipY + 5}, ${leftWaistX - 5} ${waistY}, ${leftShoulderX - 2} ${shoulderY + 10}
            `}
            fill="url(#bodyGradient)"
            className="transition-all duration-1000 ease-in-out"
          />
          
          <path 
            d={`
              M ${rightShoulderX} ${shoulderY + 2}
              C ${rightShoulderX + 8} ${shoulderY + 15}, ${rightWaistX + 12} ${waistY + 10}, ${rightHipX + 10} ${hipY + 10}
              C ${rightHipX + 5} ${hipY + 5}, ${rightWaistX + 5} ${waistY}, ${rightShoulderX + 2} ${shoulderY + 10}
            `}
            fill="url(#bodyGradient)"
            className="transition-all duration-1000 ease-in-out"
          />

          {/* Luxury abstract lines overlay */}
          <path
            d={`
              M 50 ${neckTop + 5} 
              L 50 ${crotchY}
              M ${leftWaistX} ${waistY}
              Q 50 ${waistY + 5} ${rightWaistX} ${waistY}
            `}
            stroke="white"
            strokeOpacity="0.15"
            strokeWidth="0.5"
            fill="none"
            className="transition-all duration-1000 ease-in-out"
          />
        </g>
      </svg>
    </div>
  );
}
