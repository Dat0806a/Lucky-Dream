
import React from 'react';
import { Garment } from '../types';

interface GarmentCardProps {
  garment: Garment;
  onRemove: (id: string) => void;
}

export const GarmentCard: React.FC<GarmentCardProps> = ({ garment, onRemove }) => {
  return (
    <div className="relative aspect-square bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-md border border-brand-gold/20 dark:border-slate-800 animate-in zoom-in-50 duration-300 transition-colors">
      <img 
        src={garment.image} 
        alt={garment.name} 
        className="w-full h-full object-contain p-2"
      />
      <button 
        onClick={() => onRemove(garment.id)}
        className="absolute top-1 right-1 w-6 h-6 bg-brand-red text-white rounded-full flex items-center justify-center text-[10px] shadow-lg active:scale-90 border border-brand-gold/30"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};
