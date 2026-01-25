'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BolilloProgressBar from '../components/BolilloProgressBar';
import CrumbDisplay from '../components/CrumbDisplay';
import { getStats, Stats } from '../lib/api';

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8DC] flex flex-col items-center justify-center p-4">
        <div className="animate-bounce text-4xl mb-4">🥖</div>
        <p className="text-[#8B4513] font-bold animate-pulse">Horneando estadísticas...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#FFF8DC] flex items-center justify-center p-6 text-center">
        <div className="text-red-600 bg-red-100 p-6 rounded-xl border border-red-300 shadow-sm">
          <h2 className="font-bold text-lg mb-2">Error de Conexión</h2>
          <p>No pudimos conectar con la panadería (Backend). Intenta recargar.</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8DC] font-sans pb-32 text-[#3E2723] relative overflow-hidden selection:bg-[#DEB887] selection:text-white">
      
      {/* --- FONDO CON PATRÓN (Crucial para el Glassmorphism) --- */}
      {/* --- FONDO VIBRANTE (Crucial para el Glassmorphism) --- */}
      <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#FFF8DC]"></div>
          
          {/* PATRÓN DOTS (Para resaltar transparencia) */}
          <div className="absolute inset-0 opacity-[0.15]" 
               style={{ 
                   backgroundImage: 'radial-gradient(#8B4513 1px, transparent 1px)', 
                   backgroundSize: '20px 20px' 
               }}>
          </div>

          {/* Orbes de color para resaltar el efecto glass (UX STRATEGY) */}
          
          {/* 1. ZONA INFO (Stats/Header): Luz Dorada/Cálida Suave */}
          <div className="absolute top-[-10%] left-[-20%] h-[600px] w-[600px] rounded-full bg-[#FFD700]/15 blur-[120px]"></div>
          
          {/* 2. ZONA ACCIÓN (FAB 'Registrar'): Luz 'Hot' Rojiza/Naranja Intensa para atraer click */}
          {/* Posicionada detrás del botón flotante (Bottom Right) */}
          <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#FF4500]/25 blur-[100px] animate-pulse-slow"></div>

          {/* 3. TOQUE SUTIL (Balance): Luz tenue en esquina opuesta superior derecha, lejos del pan */}
          <div className="absolute top-[10%] right-[-10%] h-[300px] w-[300px] rounded-full bg-[#8B4513]/10 blur-[80px]"></div>
      </div>

      {/* --- HEADER --- */}
      <header className="relative z-10 mb-8 overflow-hidden rounded-b-[2.5rem] bg-gradient-to-b from-[#8B4513] to-[#6d360f] p-8 text-[#FFF8DC] shadow-2xl ring-1 ring-white/10">
        <div className="relative z-10 text-center">
          <h1 className="text-3xl font-black tracking-tight drop-shadow-md opacity-95">MIGAJERO SERRUCHO</h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-[#DEB887] opacity-90">Monitor de Progreso</p>
          
          <div className="mt-6 flex flex-col items-center">
             <div className="text-6xl font-black tabular-nums tracking-tighter drop-shadow-lg">
               {stats.percent.toFixed(2)}<span className="text-3xl opacity-60">%</span>
             </div>
             <span className="mt-2 rounded-full bg-black/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">Completado</span>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-md space-y-6 px-4">

        {/* --- TARJETA PRINCIPAL (BOLILLO) - GLASSMORPHISM --- */}
        <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/30 p-6 shadow-xl backdrop-blur-md transition-transform hover:scale-[1.01]">
          <h2 className="mb-6 text-center text-xs font-bold uppercase tracking-widest text-[#8B4513]/70">Visualización</h2>
          
          {/* Contenedor con scroll horizontal suave */}
          <div className="flex justify-center overflow-x-auto pb-2 scrollbar-hide">
            <div className="origin-center transform scale-90 drop-shadow-md sm:scale-100">
                <BolilloProgressBar 
                  currentCrumbs={stats.total_crumbs} 
                  maxCrumbs={stats.goal}
                />
            </div>
          </div>
        </section>

        {/* --- ESTADÍSTICAS (GRID) --- */}
        <section className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/30 p-5 shadow-lg backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white/40">
            <span className="mb-2 text-3xl filter drop-shadow-sm">🐜</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Acumuladas</span>
            <span className="text-2xl font-black text-[#8B4513] tabular-nums">{stats.total_crumbs.toLocaleString()}</span>
          </div>
          
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/30 p-5 shadow-lg backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white/40">
            <span className="mb-2 text-3xl filter drop-shadow-sm">🏁</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Meta Final</span>
            <span className="text-2xl font-black text-[#8B4513] tabular-nums">{stats.goal.toLocaleString()}</span>
          </div>
        </section>

        {/* --- DETALLES TÉCNICOS (ACORDEÓN) --- */}
        <section className="overflow-hidden rounded-2xl border border-white/20 bg-white/20 shadow-sm backdrop-blur-sm">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="flex w-full items-center justify-between p-4 text-sm font-bold text-[#8B4513] transition-colors hover:bg-white/40"
          >
            <span>{showDetails ? 'Ocultar' : 'Ver'} detalles técnicos</span>
            <span className={`transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {showDetails && (
            <div className="border-t border-white/10 bg-white/10 p-4">
               <p className="mb-3 text-center text-xs italic text-gray-600">Representación cruda de las migajas:</p>
               <div className="origin-top scale-95 opacity-80">
                  <CrumbDisplay count={stats.total_crumbs} />
               </div>
            </div>
          )}
        </section>

      </div>

      {/* --- BOTÓN DE ACCIÓN FLOTANTE (FAB) CON GLASSMORPHISM AVANZADO --- */}
      <div className="pointer-events-none fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4">
        <Link 
          href="/log" 
          className="
            pointer-events-auto
            group
            flex items-center gap-3 rounded-full py-4 px-8
            transition-all duration-300
            
            /* ESTILOS VISUALES - GLASSMORPHISM PURO */
            bg-white/20
            backdrop-blur-xl
            border border-white/40
            shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
            
            /* TEXTO */
            text-[#8B4513] font-black tracking-widest uppercase
            
            /* ESTADOS */
            hover:scale-105 
            hover:bg-white/40
            hover:border-white/60
            hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.25)]
            active:scale-95
            active:bg-white/50
          "
        >
          <span className="text-2xl filter drop-shadow-sm transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">✍️</span>
          <span>Registrar Migaja</span>
        </Link>
      </div>

    </main>
  );
}
