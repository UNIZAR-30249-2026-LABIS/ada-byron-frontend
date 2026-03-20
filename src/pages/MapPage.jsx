import { useState } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import ReservationForm from '../components/ReservationForm';
import { useNavigate } from 'react-router-dom';

const FLOOR_OPTIONS = [
    { value: 'S1', label: 'Sótano 1' },
    { value: '0', label: 'Planta Baja' },
    { value: '1', label: 'Planta 1' },
    { value: '2', label: 'Planta 2' },
    { value: '3', label: 'Planta 3' },
    { value: '4', label: 'Planta 4' },
    { value: '5', label: 'Planta 5' },
];

export default function MapPage() {
    const navigate = useNavigate();
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [selectedFloor, setSelectedFloor] = useState('0');

    return (
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
            {/* Left Sidebar (Compact) */}
            <aside className="w-[260px] bg-white border-r border-gray-200 flex flex-col h-full shrink-0 shadow-sm z-10 relative">
                <div className="p-4 flex flex-col h-full">
                    {/* Header */}
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center w-max text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4 cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver
                    </button>
                    
                    <h1 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Mapa del Edificio</h1>

                    {/* Filters Form */}
                    <div className="flex flex-col gap-4 flex-1">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5" htmlFor="filter-dia">Día</label>
                            <div className="relative">
                                <input 
                                    id="filter-dia"
                                    type="date" 
                                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1 min-w-0">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5" htmlFor="filter-hora">Hora</label>
                                <select 
                                    id="filter-hora"
                                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-2 py-2 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                        backgroundPosition: 'right 0.25rem center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: '1.25em 1.25em',
                                        paddingRight: '1.5rem'
                                    }}
                                >
                                    <option value="08:00">08:00</option>
                                    <option value="09:00">09:00</option>
                                    <option selected value="10:00">10:00</option>
                                    <option value="11:00">11:00</option>
                                    <option value="12:00">12:00</option>
                                    <option value="13:00">13:00</option>
                                    <option value="14:00">14:00</option>
                                    <option value="15:00">15:00</option>
                                    <option value="16:00">16:00</option>
                                    <option value="17:00">17:00</option>
                                    <option value="18:00">18:00</option>
                                    <option value="19:00">19:00</option>
                                    <option value="20:00">20:00</option>
                                </select>
                            </div>
                            <div className="flex-1 min-w-0">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5" htmlFor="filter-planta">Planta</label>
                                <select 
                                    id="filter-planta"
                                    value={selectedFloor}
                                    onChange={(e) => {
                                        setSelectedFloor(e.target.value);
                                        setSelectedSpace(null);
                                    }}
                                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-2 py-2 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer font-medium"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                        backgroundPosition: 'right 0.25rem center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: '1.25em 1.25em',
                                        paddingRight: '1.5rem'
                                    }}
                                >
                                    {FLOOR_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button className="w-full py-2.5 bg-[#0f172a] text-white text-xs font-semibold rounded-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 transition-all shadow-sm active:scale-[0.98] cursor-pointer">
                            Actualizar Vista
                        </button>

                        <div className="mt-2 bg-[#eff6ff] border border-blue-100 rounded-xl p-3 text-center transition-transform hover:-translate-y-0.5 cursor-pointer group shadow-sm shrink-0">
                            <p className="text-[#2563eb] text-[11px] font-medium leading-snug mb-2">
                                ¿Necesitas características específicas?
                            </p>
                            <button className="text-blue-700 text-xs font-bold group-hover:text-blue-800 transition-colors inline-flex items-center gap-1 pointer-events-none">
                                Buscador Inteligente <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                            </button>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="pt-4 mt-auto overflow-y-auto">
                        <div className="flex flex-col gap-1.5 text-[11px] font-medium text-gray-600">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6] shadow-sm"></span> Aulas
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444] shadow-sm"></span> Laboratorios
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[#0ea5e9] shadow-sm"></span> Salas informática
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[#8b5cf6] shadow-sm"></span> Salas de reuniones
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[#1d4ed8] shadow-sm"></span> Salón de actos
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[#2563eb] shadow-sm"></span> Biblioteca
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[#a855f7] shadow-sm"></span> Despachos
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[#ffffff] border border-[#cbd5e1] shadow-sm"></span> Zonas de paso / Contexto
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content (Map) */}
            <main className="flex-1 relative bg-[#f1f5f9] overflow-hidden p-4 sm:p-6 flex flex-col min-w-0">
                {/* CSS Grid Pattern Background */}
                <div 
                    className="absolute inset-0 pointer-events-none opacity-[0.35]" 
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, #cbd5e1 1px, transparent 1px),
                            linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px'
                    }}
                ></div>

                {/* Map Area Container */}
                <div className="relative flex-1 w-full bg-white rounded-2xl shadow-xl border-4 border-white overflow-hidden flex items-center justify-center isolation-auto">
                    <InteractiveMap selectedFloor={selectedFloor} onSpaceSelect={setSelectedSpace} />
                    
                    {/* Floating Reservation Form */}
                    {selectedSpace && (
                        <div className="absolute top-4 right-4 z-[1000] drop-shadow-2xl animate-in fade-in slide-in-from-right-4 duration-200">
                            <ReservationForm selectedSpace={selectedSpace} onClose={() => setSelectedSpace(null)} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}