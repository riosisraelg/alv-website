import React from 'react';

interface CrumbDisplayProps {
  count: number;
}

const CrumbDisplay: React.FC<CrumbDisplayProps> = ({ count }) => {
  // We want to group by 5.
  // Example: 12 -> "..... ..... .."
  // We will generate an array of groups.
  
  const groups: number[] = [];
  let remaining = count;
  while (remaining > 0) {
    if (remaining >= 5) {
      groups.push(5);
      remaining -= 5;
    } else {
      groups.push(remaining);
      remaining = 0;
    }
  }

  // To avoid rendering 80,000 dots, we might need a limit.
  // The user says "el objetivo es llegar a 80000 mil migajas".
  // If count is high, we probably shouldn't render individual dots for all of them.
  // Maybe just the recent ones or a summarized view?
  // "una conversacion ... es una migaja que se representa con un punto"
  // "La regla es que se agrupen de cinco en cinco y se separen por un espacio"
  
  // If we have thousands, rendering DOM elements will crash.
  // Let's limit the visual display to the specific requirement for "representation", 
  // maybe the last few or use a canvas? 
  // User asked "el objetivo es llegar a 80000". 
  // If I render 80000 dots, that's heavy but manageable with canvas, but heavy with DOM.
  // I will implement a "Recent Crumbs" view or a specialized text representation.
  // Or maybe "Crumbs collected: [dots...]"
  
  // Let's cap the visual display to last 100 crumbs for performance, 
  // and show a total count. 
  // The user might want to see ALL visually, but 80k is too many for DOM.
  // I'll add a 'Show All' warning or just show a text-based pattern for large numbers if needed.
  // For now, I'll render simple text dots with a limit.
  
  // Renderizamos hasta 2000 puntos para evitar crasheos, pero con scroll vertical si es necesario
  const MAX_DISPLAY = 2000;
  const displayGroups = groups.slice(0, Math.ceil(MAX_DISPLAY / 5));
  
  return (
    <div className="font-mono text-xs sm:text-sm tracking-tighter leading-none text-[#8B4513] opacity-80 break-words whitespace-normal max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-200">
       {displayGroups.map((groupSize, index) => (
         <span key={index} className="mr-1 inline-block">
           {'.'.repeat(groupSize)}
         </span>
       ))}
       {count > MAX_DISPLAY && (
           <div className="mt-2 text-xs font-bold text-orange-600 block">
               ... y {count - MAX_DISPLAY} migajas más (ocultas por rendimiento)
           </div>
       )}
    </div>
  );
};

export default CrumbDisplay;
