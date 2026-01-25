import React from 'react';

interface BolilloProgressBarProps {
  currentCrumbs: number;
  maxCrumbs?: number;
}

const BolilloProgressBar: React.FC<BolilloProgressBarProps> = ({ currentCrumbs, maxCrumbs = 80000 }) => {
  // Matriz de 16x8 para el Pixel Art del Bolillo
  const grid = [
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0],
    [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
    [1, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1],
    [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
    [0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  ];
  
  // 1. Calcular cuántos "píxeles de miga" existen (celdas valor 2 o 3)
  const totalFillablePixels = grid.flat().filter(cell => cell === 2 || cell === 3).length;
  
  // 2. Calcular cuántas migajas caben en CADA píxel para distribuir uniformemente
  //    Ej: 80,000 / 68 píxeles ~= 1,176 migajas por píxel.
  const crumbsPerPixel = maxCrumbs / totalFillablePixels;

  // Contador global para ir "llenando" los píxeles en orden visual
  let crumbsDistributed = 0;

  // Función helper para obtener color HSL interpolado (Cream -> Orange -> Brown)
  // ratio: 0.0 a 1.0
  const getBreadColor = (ratio: number) => {
      // Definimos etapas visuales clave
      // 0.0: Masa Cruda (Cream/White) - HSL(45, 100%, 94%)
      // 0.3: Pre-Horneado (Pale Gold) - HSL(40, 90%, 80%)
      // 0.6: Horneando (Orange)       - HSL(30, 90%, 60%)
      // 1.0: Tostado (Brown)          - HSL(25, 85%, 45%)
      
      let h, s, l;
      
      if (ratio < 0.3) {
          // Fase 1: Masa -> Pre-Horneado
          const localRatio = ratio / 0.3;
          h = 45 - (5 * localRatio);  // 45 -> 40
          s = 100 - (10 * localRatio); // 100 -> 90
          l = 94 - (14 * localRatio);  // 94 -> 80
      } else if (ratio < 0.6) {
          // Fase 2: Pre-Horneado -> Horneando
          const localRatio = (ratio - 0.3) / 0.3;
          h = 40 - (10 * localRatio); // 40 -> 30
          s = 90;                     // Constantish
          l = 80 - (20 * localRatio); // 80 -> 60
      } else {
          // Fase 3: Horneando -> Tostado
          const localRatio = (ratio - 0.6) / 0.4;
          h = 30 - (5 * localRatio);  // 30 -> 25
          s = 90 - (5 * localRatio);  // 90 -> 85
          l = 60 - (15 * localRatio); // 60 -> 45
      }
      return `hsl(${h}, ${s}%, ${l}%)`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-[repeat(16,1fr)] gap-0 border-4 border-transparent w-[320px] aspect-[2/1]">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            let content = null;
            let bgStyle = 'bg-transparent';

            // --- BORDES DEL BOLILLO (Estáticos) ---
            if (cell === 1) {
              bgStyle = 'bg-[#8B4513] border-[#5D2906] opacity-90'; 
            } 
            
            // --- MIGA DE PAN (Dinámico) ---
            else if (cell === 2 || cell === 3) {
               // 1. Determinar cuántas migajas tocan a este píxel específico
               //    Restamos lo que ya distribuimos del total que tiene el usuario.
               const crumbsForThisPixel = Math.max(0, Math.min(crumbsPerPixel, currentCrumbs - crumbsDistributed));
               
               // Distribuimos el contador para el siguiente píxel
               crumbsDistributed += crumbsPerPixel;

               // 2. Si este píxel tiene ALGO de migaja (> 0), calculamos su visual
               if (crumbsForThisPixel > 0) {
                   
                   // A. PROGRESO CUANTIZADO (Pasos de 5 migajas)
                   //    El usuario quiere ver cambios "cada 5 migajas".
                   //    Redondeamos hacia abajo al múltiplo de 5 más cercano para crear "escalones" visuales.
                   const stepSize = 5;
                   const quantizedCrumbs = Math.floor(crumbsForThisPixel / stepSize) * stepSize;
                   
                   // Si hay menos de 5 migajas pero > 0, mostramos el primer escalón de todas formas para no ocultar el progreso "1 crumb".
                   const visualCrumbs = (crumbsForThisPixel > 0 && quantizedCrumbs === 0) ? 1 : quantizedCrumbs;

                   const ratio = visualCrumbs / crumbsPerPixel;
                   
                   // B. VISIBILIDAD (Masa Cruda)
                   //    Un píxel apenas empezado (1-5 migajas) debe ser MUY visible.
                   //    Opacity Base: 0.4 (Masa Fantasma) + Progreso.
                   //    Esto asegura que "1 migaja" ya pinte el píxel al 40% de opacidad.
                   const opacity = 0.4 + (ratio * 0.6); 

                   // C. COLOR (Gradiente de Cocción)
                   const breadColor = getBreadColor(ratio);

                    // CHECK: Is this the "Active" pixel? (Partially filled or the very last one active)
                    const isActive = crumbsForThisPixel < crumbsPerPixel && crumbsForThisPixel > 0;

                    content = (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className="w-full h-full relative"
                        >
                            {/* Fondo vacío tenue */}
                            <div className="absolute inset-0 bg-[#F5DEB3]/10"></div>
                            
                            {/* MIGA ACTIVA */}
                            <div 
                                className={`absolute inset-0 transition-all duration-500 ease-out 
                                    ${isActive ? 'animate-pulse z-20 ring-2 ring-white/90 shadow-[0_0_15px_#FFD700] brightness-110 drop-shadow-lg scale-105' : ''}
                                `}
                                style={{ 
                                    backgroundColor: breadColor, 
                                    opacity: opacity,
                                    // Sutil brillo interior
                                    boxShadow: ratio < 0.5 ? 'inset 0 0 4px rgba(255,255,255,0.3)' : 'none'
                                }}
                            ></div>
                        </div>
                   );
                   bgStyle = ''; // Usamos content
               } else {
                   // Píxel vacío (Masa inexistente)
                   bgStyle = cell === 3 ? 'bg-[#DEB887]/20' : 'bg-[#F5DEB3]/20';
               }
            }

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`w-full h-full ${bgStyle}`}
                style={{ shapeRendering: 'crispEdges' }}
              >
                {content}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BolilloProgressBar;
