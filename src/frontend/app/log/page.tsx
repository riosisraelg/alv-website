'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logInteraction } from '../../lib/api';

// --- DEFINICIONES DE TIPOS ---
type ActionType = 'CHAT' | 'CALL' | 'DEEP' | 'PENALTY';

interface SmartCardProps {
    title: string;
    subtitle?: string;
    icon: string;
    value: number;
    onTap: () => void;
    onHold: () => void;
    onChange: (delta: number) => void;
    color: string;
    accent: string;
    isDanger?: boolean;
}

interface NumpadOverlayProps {
    initialValue: number;
    onSave: (val: number) => void;
    onCancel: () => void;
    title: string;
}

// --- UTILIDAD HÁPTICA ---
// Define patrones de vibración para mejorar la UX
const vibrate = (pattern: 'MICRO' | 'MEDIUM' | 'HEAVY' | 'DOUBLE') => {
    if (typeof navigator === 'undefined' || !(navigator as any).vibrate) return;
    
    switch (pattern) {
        case 'MICRO': return (navigator as any).vibrate(5);   // Turbo / Toques rápidos
        case 'MEDIUM': return (navigator as any).vibrate(30); // Interacciones estándar
        case 'HEAVY': return (navigator as any).vibrate(50);  // Confirmaciones
        case 'DOUBLE': return (navigator as any).vibrate([50, 30, 50]); // Alertas / Borrar
    }
};

export default function SmartLoggerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Estado unificado de contadores
    const [counts, setCounts] = useState<Record<ActionType, number>>({
        CHAT: 0,
        CALL: 0,
        DEEP: 0,
        PENALTY: 0
    });

    const [editingType, setEditingType] = useState<ActionType | null>(null);

    // --- LÓGICA DE NEGOCIO ---
    const updateCount = (type: ActionType, delta: number) => {
        setCounts(prev => {
            const nextVal = prev[type] + delta;
            // Unify logic: Cap properly at 80,000 like the Keypad
            if (nextVal > 80000) {
                 vibrate('DOUBLE'); // Feedback limit reached
                 return prev;
            }
            return {
                ...prev,
                [type]: Math.max(0, nextVal)
            };
        });
    };

    const setExactCount = (val: number) => {
        if (editingType) {
            setCounts(prev => ({ ...prev, [editingType]: val }));
            setEditingType(null); 
        }
    };

    // Cálculos
    const totalCrumbs = (counts.CHAT * 1) + (counts.CALL * 1) + (counts.DEEP * 5) - counts.PENALTY;
    const totalActions = counts.CHAT + counts.CALL + counts.DEEP + counts.PENALTY;

    // Enviar
    const handleSubmit = async () => {
        if (totalActions === 0) return;
        
        vibrate('HEAVY'); // Feedback fuerte al intentar enviar

        let confirmText = `¿Registrar +${totalCrumbs} migajas?`;
        if (counts.PENALTY > 0 && totalCrumbs < 0) confirmText = `¿Confirmas RESTAR ${Math.abs(totalCrumbs)} migajas?`;
        
        if (!window.confirm(confirmText)) return;

        setLoading(true);
        try {
            const promises = [];
            for (let i = 0; i < counts.CHAT; i++) promises.push(logInteraction({ type: 'CONVERSATION', count_or_duration: 5, crumbs: 0 }));
            for (let i = 0; i < counts.CALL; i++) promises.push(logInteraction({ type: 'CALL', count_or_duration: 1, crumbs: 0 }));
            for (let i = 0; i < counts.DEEP; i++) promises.push(logInteraction({ type: 'CALL', count_or_duration: 10, crumbs: 0 }));
            if (counts.PENALTY > 0) promises.push(logInteraction({ type: 'REMOVAL', count_or_duration: counts.PENALTY, crumbs: 0 }));

            await Promise.all(promises);
            router.push('/');
        } catch (err) {
            alert('Error de conexión. Intenta de nuevo.');
            setLoading(false);
        }
    };

    const handleClear = () => {
        vibrate('DOUBLE');
        setCounts({ CHAT: 0, CALL: 0, DEEP: 0, PENALTY: 0 });
    };

    return (
        <div className="min-h-screen bg-[#FFF8DC] text-[#3E2723] font-sans pb-48 select-none relative overflow-hidden">
            
             {/* --- FONDO VIBRANTE (Copiado de Main Page para consistencia) --- */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[#FFF8DC]"></div>
                
                {/* PATRÓN DOTS (Para resaltar transparencia) */}
                <div className="absolute inset-0 opacity-[0.15]" 
                     style={{ 
                         backgroundImage: 'radial-gradient(#8B4513 1px, transparent 1px)', 
                         backgroundSize: '20px 20px' 
                     }}>
                </div>

                {/* ORBES UX (Log Page) */}
                
                {/* 1. HEADER ZONE: Luz tenue para título y botón 'Atrás' */}
                <div className="absolute top-[-15%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#FFD700]/20 blur-[100px]"></div>

                {/* 2. CARDS ZONE: Luz lateral derecha para iluminar las tarjetas centrales */}
                <div className="absolute top-[30%] right-[-20%] h-[400px] w-[400px] rounded-full bg-[#FF8C00]/15 blur-[90px]"></div>

                {/* 3. DOCK ZONE (Hot Zone): Luz intensa abajo para el botón de REGISTRAR/SUBMIT */}
                <div className="absolute bottom-[-10%] left-[10%] h-[500px] w-[500px] rounded-full bg-[#FF4500]/25 blur-[100px]"></div>
            </div>

            <header className="p-6 text-center relative z-10 grid grid-cols-[auto_1fr_auto] items-center">
                <button 
                  onClick={() => router.back()} 
                  className="p-2 -ml-2 rounded-full text-[#8B4513]/70 hover:bg-[#8B4513]/10 active:scale-95 transition-all text-xl"
                  title="Volver"
                >
                  ←
                </button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight opacity-80">¿Qué cosechaste hoy?</h1>
                    <p className="text-xs text-[#A0522D] mt-1">Mantén presionado para sumar en masa</p>
                </div>
                <div className="w-8"></div> {/* Spacer for alignment */}
            </header>

            <div className="max-w-md mx-auto px-4 space-y-4 relative z-10">
                
                <SmartCard 
                    title="Conversación Chat"
                    icon="💬"
                    value={counts.CHAT}
                    onTap={() => { vibrate('MICRO'); updateCount('CHAT', 1); }}
                    onHold={() => { vibrate('MEDIUM'); setEditingType('CHAT'); }}
                    onChange={(d: number) => { vibrate('MICRO'); updateCount('CHAT', d); }}
                    color="bg-white/30 border-white/20"
                    accent="text-orange-600"
                />

                <SmartCard 
                    title="Llamada de Voz"
                    icon="📞"
                    value={counts.CALL}
                    onTap={() => { vibrate('MICRO'); updateCount('CALL', 1); }}
                    onHold={() => { vibrate('MEDIUM'); setEditingType('CALL'); }}
                    onChange={(d: number) => { vibrate('MICRO'); updateCount('CALL', d); }}
                    color="bg-white/30 border-white/20"
                    
                    /* Use blueish tint for specific card if desired, but glass usually neutral */
                    accent="text-blue-600"
                />

                <SmartCard 
                    title="Conexión Profunda"
                    subtitle="(Vale x5)"
                    icon="❤️"
                    value={counts.DEEP}
                    onTap={() => { vibrate('MICRO'); updateCount('DEEP', 1); }}
                    onHold={() => { vibrate('MEDIUM'); setEditingType('DEEP'); }}
                    onChange={(d: number) => { vibrate('MICRO'); updateCount('DEEP', d); }}
                    color="bg-white/30 border-white/20"
                    accent="text-indigo-600"
                />

                <div className="h-4"></div>

                <SmartCard 
                    title="Castigo / Restar"
                    icon="🔥"
                    value={counts.PENALTY}
                    onTap={() => { vibrate('MICRO'); updateCount('PENALTY', 1); }}
                    onHold={() => { vibrate('MEDIUM'); setEditingType('PENALTY'); }}
                    onChange={(d: number) => { vibrate('MICRO'); updateCount('PENALTY', d); }}
                    color="bg-red-50/50 border-red-200/50 backdrop-blur-md"
                    accent="text-red-600"
                    isDanger
                />
            </div>

            {/* --- SMART DOCK (BARRA INFERIOR) --- */}
            {/* FIX: Se añade z-[100] y lógica flex para evitar colapsos en móvil */}
            {/* --- SMART DOCK (BARRA INFERIOR MEJORADA) --- */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-lg border-t border-white/40 shadow-[0_-5px_15px_rgba(0,0,0,0.1)] z-[100] pb-6 pt-2 transition-all">
                <div className="max-w-md mx-auto px-4 flex flex-col gap-3">
                    
                    {/* RESUMEN (Fila Superior) - Siempre visible y completo */}
                    <div className="w-full text-center">
                        {totalActions === 0 ? (
                            <span className="text-xs text-gray-400 italic">Selecciona acciones arriba...</span>
                        ) : (
                            <div className="text-xs font-bold text-gray-600 flex flex-wrap justify-center gap-x-3">
                                {counts.CHAT > 0 && <span>{counts.CHAT} Chats ({counts.CHAT * 1})</span>}
                                {counts.CALL > 0 && <span>{counts.CALL} Llamadas ({counts.CALL * 1})</span>}
                                {counts.DEEP > 0 && <span>{counts.DEEP} Profundas ({counts.DEEP * 5})</span>}
                                {counts.PENALTY > 0 && <span className="text-red-500">-{counts.PENALTY} Castigos (-{counts.PENALTY})</span>}
                            </div>
                        )}
                    </div>

                    {/* ACCIONES (Fila Inferior - Grande y Clara) */}
                    <div className="flex items-stretch gap-3 h-14">
                        {/* Botón Borrar */}
                        <button 
                            onClick={handleClear}
                            disabled={totalActions === 0}
                            className={`px-4 rounded-xl transition-all flex items-center justify-center border-2 border-transparent ${totalActions === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100/50 hover:text-red-500 active:scale-95'}`}
                            title="Limpiar"
                        >
                            🗑️
                        </button>

                        {/* Botón Registrar (Expandido) */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || totalActions === 0 || totalCrumbs > 80000}
                            className={`flex-1 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 backdrop-blur-md border border-white/20
                                ${totalActions === 0 
                                    ? 'bg-gray-200/50 text-gray-400 shadow-none cursor-not-allowed' 
                                    : totalCrumbs > 80000
                                        ? 'bg-red-800/90 text-white cursor-not-allowed opacity-100' // Estilo Bloqueado (Opacidad 100 para leer bien)
                                        : totalCrumbs < 0 
                                            ? 'bg-red-600/90 text-white shadow-red-500/30' 
                                            : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-orange-500/30'
                                }
                            `}
                        >
                            <span className="text-sm uppercase tracking-wider">
                                {loading ? '...' : (totalCrumbs > 80000 ? `EXCEDE LÍMITE (${totalCrumbs.toLocaleString()})` : totalCrumbs < 0 ? 'PENALIZAR' : 'REGISTRAR')}
                            </span>
                            {/* Mostrar el total numérico incluso si está bloqueado, para que el usuario entienda la matemática */}
                            {totalActions > 0 && totalCrumbs <= 80000 && (
                                <span className={`text-xl font-black px-2 py-0.5 rounded-lg ${totalCrumbs < 0 ? 'bg-black/20' : 'bg-black/10'}`}>
                                    {totalCrumbs > 0 ? '+' : ''}{totalCrumbs}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {editingType && (
                <NumpadOverlay 
                    initialValue={counts[editingType]} 
                    onSave={setExactCount} 
                    onCancel={() => setEditingType(null)} 
                    title={editingType === 'CHAT' ? 'Chats' : editingType === 'CALL' ? 'Llamadas' : editingType === 'DEEP' ? 'Profundas' : 'Castigos'}
                />
            )}

        </div>
    );
}

// --- SMART CARD (Con soporte Turbo Mode) ---
// --- SMART CARD (Con soporte Turbo Mode y correcciones de estado) ---
function SmartCard({ title, subtitle, icon, value, onTap, onHold, onChange, color, accent, isDanger }: SmartCardProps) {
    // Refs separados para evitar conflictos entre el Tap de la tarjeta y el Turbo de los botones
    const cardPressTimer = useRef<any>(null);
    const turboDelayTimer = useRef<any>(null);
    const turboInterval = useRef<any>(null);
    const isLongPress = useRef(false);

    // Limpieza de intervalos al desmontar o actualizar para evitar "fantasmas"
    useEffect(() => {
        return () => {
            if (cardPressTimer.current) clearTimeout(cardPressTimer.current);
            if (turboDelayTimer.current) clearTimeout(turboDelayTimer.current);
            if (turboInterval.current) clearInterval(turboInterval.current);
        };
    }, []);

    // --- MANEJO DE TAP PRINCIPAL (TARJETA) ---
    const startPress = () => {
        isLongPress.current = false;
        cardPressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            onHold();
        }, 600);
    };

    const endPress = () => {
        if (cardPressTimer.current) clearTimeout(cardPressTimer.current);
        if (!isLongPress.current) {
            onTap();
        }
    };

    // --- MANEJO DE TURBO MODE (BOTONES +/-) ---
    const startTurbo = (delta: number) => {
        // Limpiar cualquier turbo preexistente por seguridad
        stopTurbo();
        
        // Ejecución inmediata del primer clic
        onChange(delta);
        
        // Espera antes de arrancar el turbo (para permitir clics simples)
        turboDelayTimer.current = setTimeout(() => {
            turboInterval.current = setInterval(() => {
                onChange(delta);
            }, 100); // Velocidad turbo: cada 100ms
        }, 300);
    };

    const stopTurbo = () => {
        if (turboDelayTimer.current) clearTimeout(turboDelayTimer.current);
        if (turboInterval.current) clearInterval(turboInterval.current);
    };

    return (
        <div className={`relative rounded-2xl border-2 shadow-sm transition-all duration-200 overflow-hidden ${color} ${value > 0 ? 'border-opacity-100 ring-2 ring-offset-1 ring-opacity-20 ' + (isDanger ? 'ring-red-200' : 'ring-orange-200') : 'border-opacity-60'}`}>
            
            <div 
                className="p-5 pr-16 flex items-center justify-between cursor-pointer active:bg-black/5 transition-colors min-h-[5rem]"
                onTouchStart={startPress}
                onTouchEnd={endPress}
                onMouseDown={startPress}
                onMouseUp={endPress}
                onMouseLeave={() => {
                    if (cardPressTimer.current) clearTimeout(cardPressTimer.current);
                }}
            >
                <div className="flex items-center gap-3 pointer-events-none">
                    <span className="text-3xl filter drop-shadow-sm">{icon}</span>
                    <div>
                        <div className={`font-bold text-lg leading-none ${isDanger ? 'text-red-800' : 'text-[#3E2723]'}`}>{title}</div>
                        {subtitle && <div className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</div>}
                    </div>
                </div>

                <div className={`font-black transition-transform duration-200 ${value > 0 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'} ${accent}
                    ${value.toString().length > 5 ? 'text-2xl' : value.toString().length > 4 ? 'text-3xl' : 'text-4xl'}
                `}>
                    {value}
                </div>
            </div>

            {value > 0 && (
                <div 
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10"
                    // Detener propagación para que tocar los botones no active el click de la tarjeta
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                >
                     {/* Botón Incrementar con Turbo */}
                     <button 
                        onMouseDown={(e) => { startTurbo(1); }}
                        onMouseUp={stopTurbo}
                        onMouseLeave={stopTurbo}
                        onTouchStart={(e) => { startTurbo(1); }}
                        onTouchEnd={(e) => { e.preventDefault(); stopTurbo(); }}
                        className="w-10 h-10 flex items-center justify-center bg-white/90 rounded-full shadow-md text-green-600 font-bold hover:bg-white border border-green-100 active:scale-90 transition-transform select-none touch-manipulation"
                     >
                        +
                     </button>
                     {/* Botón Decrementar con Turbo */}
                     <button 
                        onMouseDown={(e) => { startTurbo(-1); }}
                        onMouseUp={stopTurbo}
                        onMouseLeave={stopTurbo}
                        onTouchStart={(e) => { startTurbo(-1); }}
                        onTouchEnd={(e) => { e.preventDefault(); stopTurbo(); }}
                        className="w-10 h-10 flex items-center justify-center bg-white/90 rounded-full shadow-md text-red-500 font-bold hover:bg-white border border-red-100 active:scale-90 transition-transform select-none touch-manipulation"
                     >
                        -
                     </button>
                </div>
            )}
        </div>
    );
}

// --- NUMPAD OVERLAY (Teclado numérico) ---
function NumpadOverlay({ initialValue, onSave, onCancel, title }: NumpadOverlayProps) {
    const [valStr, setValStr] = useState('');

    const handleNum = (n: string) => {
        vibrate('MICRO'); // Feedback táctil al teclear
        const nextValStr = valStr + n;
        const nextVal = parseInt(nextValStr);
        
        // LIMIT: Max 80,000 as requested
        if (nextVal <= 80000) {
             setValStr(nextValStr);
        } else {
             vibrate('DOUBLE'); // Feedback de error si excede
        }
    };
    
    const handleDel = () => {
        vibrate('MICRO');
        setValStr(prev => prev.slice(0, -1));
    };

    const handleOk = () => {
        vibrate('MEDIUM'); // Feedback al confirmar valor
        const final = valStr === '' ? 0 : parseInt(valStr);
        onSave(final);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-end sm:items-center justify-center animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-slide-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Editar: <span className="text-orange-600">{title}</span></h2>
                    <button onClick={onCancel} className="text-gray-400 p-2 text-xl">✕</button>
                </div>

                <div className="bg-gray-100 p-4 rounded-xl mb-6 text-center">
                    <span className="text-5xl font-black text-[#3E2723] tracking-widest">
                        {valStr || <span className="opacity-20">0</span>}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                    {[1,2,3,4,5,6,7,8,9].map(n => (
                        <button key={n} onClick={() => handleNum(n.toString())} className="p-4 bg-white border-b-4 border-gray-200 active:border-b-0 active:translate-y-1 rounded-xl text-2xl font-bold text-gray-700">
                            {n}
                        </button>
                    ))}
                    <button onClick={handleDel} className="p-4 rounded-xl text-xl font-bold text-red-400 hover:bg-red-50">⌫</button>
                    <button onClick={() => handleNum('0')} className="p-4 bg-white border-b-4 border-gray-200 active:border-b-0 active:translate-y-1 rounded-xl text-2xl font-bold text-gray-700">0</button>
                    <button onClick={handleOk} className="p-4 bg-orange-500 border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 rounded-xl text-xl font-bold text-white">OK</button>
                </div>
            </div>
        </div>
    );
}
