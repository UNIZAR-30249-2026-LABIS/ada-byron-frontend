import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const CATEGORY_OPTIONS = [
    { value: '', label: 'Cualquier categoría' },
    { value: 'Aula', label: 'Aula' },
    { value: 'Laboratorio', label: 'Laboratorio' },
    { value: 'Seminario', label: 'Seminario' },
    { value: 'Despacho', label: 'Despacho' }
];

const FLOOR_OPTIONS = [
    { value: '', label: 'Cualquier planta' },
    { value: 'S1', label: 'Sótano 1' },
    { value: '0', label: 'Planta Baja' },
    { value: '1', label: 'Planta 1' },
    { value: '2', label: 'Planta 2' },
    { value: '3', label: 'Planta 3' },
    { value: '4', label: 'Planta 4' },
    { value: '5', label: 'Planta 5' }
];

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filtros locales
    const [filterCategory, setFilterCategory] = useState('');
    const [filterFloor, setFilterFloor] = useState('');

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('admin/reservations/live');
            setReservations(response.data);
        } catch (error) {
            console.error("Error fetching live reservations:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRescind = (id) => {
        // HU-18: Later integrated with SignalR
        console.log("Rescinding reservation:", id);
        alert(`Solicitud de rescisión enviada para la reserva ${id}.`);
    };

    const filteredData = reservations.filter(res => {
        const matchesCategory = filterCategory === '' || res.nombreEspacio.includes(filterCategory);
        const matchesFloor = filterFloor === '' || res.espacioId.includes(`.${filterFloor}.`) || res.espacioId.includes(`.0${filterFloor}.`);
        // Note: Simple heuristic for floor filtering based on our ID pattern (e.g. ADA.1200.01.010)
        return matchesCategory && matchesFloor;
    });

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header / Navbar */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">Panel de Supervisión</h1>
                        <p className="text-xs text-gray-500 font-medium">Gestión de Reservas en Tiempo Real</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[11px] font-bold text-green-700 uppercase tracking-tight">Sistema Online</span>
                    </div>
                    <button 
                         onClick={() => navigate('/map')}
                         className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        Volver al Mapa
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Filters */}
                <aside className="w-64 bg-white border-r border-gray-200 p-6 hidden lg:block overflow-y-auto">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Filtros de Supervisión</h3>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-2 uppercase tracking-wide">Categoría del Espacio</label>
                            <select 
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            >
                                {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-2 uppercase tracking-wide">Planta del Edificio</label>
                            <select 
                                value={filterFloor}
                                onChange={(e) => setFilterFloor(e.target.value)}
                                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            >
                                {FLOOR_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>

                        <div className="pt-4 mt-8 border-t border-gray-100">
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <h4 className="text-[11px] font-bold text-blue-800 mb-1">Supervisión Activa</h4>
                                <p className="text-[10px] text-blue-600/80 leading-relaxed">Mostrando reservas con finalización posterior a la hora actual.</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content: Table */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Estado de la Ocupación</h2>
                                <p className="text-sm text-gray-500 font-medium">{filteredData.length} reservas registradas en este momento</p>
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={fetchData}
                                    className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                                    title="Refrescar datos"
                                >
                                    <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Espacio / Aula</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Solicitante</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Horario</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Estado</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredData.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="p-3 bg-slate-50 rounded-full">
                                                            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-gray-400 text-sm font-medium">No hay reservas activas en este momento</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredData.map((res) => (
                                                <tr key={res.id} className="hover:bg-slate-50/30 transition-colors group">
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-900">{res.espacioId}</span>
                                                            <span className="text-[11px] text-gray-500 font-medium">{res.nombreEspacio}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-sm font-semibold text-gray-700">{res.solicitante}</span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-gray-700">
                                                                {new Date(res.inicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(res.fin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </span>
                                                            <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tight">Hoy</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex justify-center">
                                                            {(res.esPotencialmenteInvalida || res.estado === 'PotencialmenteInvalida') ? (
                                                                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase border border-amber-200">
                                                                    Sospechosa
                                                                </span>
                                                            ) : (
                                                                <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase border border-green-200">
                                                                    Válida
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <button 
                                                            onClick={() => handleRescind(res.id)}
                                                            className="px-4 py-2 bg-rose-50 text-rose-600 text-[11px] font-bold rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all transform hover:scale-105"
                                                        >
                                                            Anular Reserva
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        {/* Footer stats */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Total Activas</span>
                                <span className="text-3xl font-black text-gray-900">{filteredData.length}</span>
                            </div>
                            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Alertas Rojas</span>
                                <span className="text-3xl font-black text-amber-500">{filteredData.filter(r => r.esPotencialmenteInvalida).length}</span>
                            </div>
                            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Aulas Libres</span>
                                <span className="text-3xl font-black text-blue-600">84%</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
