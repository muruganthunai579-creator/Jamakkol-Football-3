import React from 'react';
import { RASIS, PLANETS } from '../constants';
import { MapPin, Clock, Calendar } from 'lucide-react';

interface RasiGridProps {
  udhayamId: number; // 1-12
  aarudamId: number; // 1-12
  lagnamId: number; // 1-12
  date: string;
  time: string;
  locationName: string;
}

const RasiGrid: React.FC<RasiGridProps> = ({ udhayamId, aarudamId, lagnamId, date, time, locationName }) => {
  return (
    <div className="w-full max-w-lg mx-auto aspect-square p-1 bg-gradient-to-br from-yellow-600 via-orange-500 to-yellow-700 rounded shadow-2xl">
      <div className="rasi-grid w-full h-full bg-white border border-yellow-600/50">
        
        {/* Center Panel (Info) */}
        <div className="cell-center text-center p-2 z-10 border-2 border-yellow-500/20 m-0.5 bg-gradient-to-b from-slate-50 to-slate-100">
          <h2 className="text-xl md:text-2xl font-bold text-red-700 drop-shadow-sm font-[Noto Sans Tamil] mb-1">
            ராசி மண்டலம்
          </h2>
          <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-widest font-bold">Jamakkol Prasanam</div>
          
          <div className="flex flex-col gap-1 w-full mt-2 items-center justify-center text-slate-700">
            <div className="flex items-center gap-1.5 text-xs font-semibold bg-white/80 px-2 py-1 rounded shadow-sm border border-slate-200">
               <MapPin className="w-3 h-3 text-red-500" />
               <span className="truncate max-w-[120px]">{locationName}</span>
            </div>
            
            <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-xs">
                    <Calendar className="w-3 h-3 text-blue-500" />
                    <span>{date}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-blue-800">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span className="text-lg">{time}</span>
                </div>
            </div>
          </div>
        </div>

        {/* Rasi Cells */}
        {RASIS.map((rasi) => {
          const isUdhayam = rasi.id === udhayamId;
          const isAarudam = rasi.id === aarudamId;
          const isLagnam = rasi.id === lagnamId;
          const planet = PLANETS[rasi.lord];
          
          // Determine cell background gradient
          let bgClass = "bg-white";
          if (isUdhayam) bgClass = "bg-gradient-to-br from-blue-50 to-blue-100 shadow-[inset_0_0_10px_rgba(37,99,235,0.1)]";
          else if (isAarudam) bgClass = "bg-gradient-to-br from-red-50 to-red-100";
          else if (isLagnam) bgClass = "bg-gradient-to-br from-emerald-50 to-emerald-100";
          
          return (
            <div 
              key={rasi.id} 
              className={`rasi-cell cell-${rasi.id} relative group hover:bg-yellow-50 transition-colors ${bgClass}`}
            >
              {/* Rasi Name (Tamil) - Top Left */}
              <div className={`absolute top-1 left-1.5 font-bold text-xs md:text-sm ${
                rasi.id % 2 === 0 ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {rasi.tamilName}
              </div>

              {/* Degrees (Optional) */}
              <div className="absolute top-1 right-1 text-[8px] text-slate-400 font-mono opacity-50">
                {rasi.degreeStart}°
              </div>

              {/* Lord Name (Tamil + ShortCode) - Center/Bottom Prominent */}
              <div className={`absolute bottom-2 left-0 right-0 text-center font-bold text-xs ${planet.color.replace('text-', 'text-opacity-80 text-')}`}>
                 <span className="text-[8px] text-slate-400 font-normal uppercase block mb-0.5 tracking-tight">Atipathi</span>
                 <div className="flex flex-col items-center leading-tight">
                    <span className={`text-sm ${planet.color.replace('text-white', 'text-slate-800')}`}>{rasi.lordTamil}</span>
                    <span className="text-[10px] text-slate-500 font-serif opacity-80">({planet.shortCode})</span>
                 </div>
              </div>

              {/* Lagnam Marker (LAG) - Top Right - Sky Based */}
              {isLagnam && (
                <div className="absolute top-0 right-0 m-1 z-30 pointer-events-none">
                   <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-white/20">
                    LAG
                   </span>
                </div>
              )}

              {/* Udhayam Marker (UDH) - Main - Jamakkol Based */}
              {isUdhayam && (
                <div className="absolute inset-0 border-[3px] border-blue-600 z-30 flex items-center justify-center pointer-events-none shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                  <span className="absolute -top-3 bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md uppercase tracking-wider">
                    Udhayam
                  </span>
                </div>
              )}

              {/* Aarudam Marker (ARU) - Bottom - Bird Based */}
              {isAarudam && (
                <div className={`absolute inset-0 border-[3px] border-red-500 z-20 flex items-center justify-center pointer-events-none ${isUdhayam ? 'm-1.5' : ''}`}>
                  <span className="absolute -bottom-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md uppercase tracking-wider">
                    Aarudam
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RasiGrid;