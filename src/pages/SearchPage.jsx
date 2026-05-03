import { useState, useEffect } from 'react';
// Import the configured api instance instead of raw axios
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import InteractiveMap from '../components/InteractiveMap';
import ReservationForm from '../components/ReservationForm';
import { getUser, isManager as hasManagerRole } from '../services/authService';

const FLOOR_OPTIONS = [
    { value: '', label: 'Cualquier planta' },
    { value: 'S1', label: 'Sótano 1' },
    { value: '0', label: 'Planta Baja' },
    { value: '1', label: 'Planta 1' },
    { value: '2', label: 'Planta 2' },
    { value: '3', label: 'Planta 3' },
    { value: '4', label: 'Planta 4' },
    { value: '5', label: 'Planta 5' },
];

const CATEGORY_OPTIONS = [
    { value: '', label: 'Cualquier categoría' },
    { value: 'Aula', label: 'Aula' },
    { value: 'Laboratorio', label: 'Laboratorio' },
    { value: 'SalaComun', label: 'Sala Común/Estudio' },
    { value: 'Seminario', label: 'Seminario' },
    { value: 'Despacho', label: 'Despacho' }
];

export default function SearchPage() {
    const navigate = useNavigate();
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [selectedFloor, setSelectedFloor] = useState('0');
    const [isManager, setIsManager] = useState(false);

    useEffect(() => {
        const user = getUser();
        setIsManager(hasManagerRole(user));
    }, []);

    // Filtros
    const [filterId, setFilterId] = useState('');
    const [filterFloor, setFilterFloor] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterCapacity, setFilterCapacity] = useState('');

    // Resultados de búsqueda
    const [allSpaces, setAllSpaces] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Initial fetch of all spaces
    useEffect(() => {
        const fetchSpaces = async () => {
            setIsSearching(true);
            try {
                // Se solicita el listado completo debido a que el backend no expone un endpoint /search específico
                const response = await api.get('/spaces');
                setAllSpaces(response.data);
                setSearchResults(response.data);
            } catch (error) {
                console.error("Error al buscar espacios:", error);
            } finally {
                setIsSearching(false);
            }
        };
        fetchSpaces();
    }, []);

    // Aplicar filtros en memoria
    useEffect(() => {
        let results = allSpaces;

        if (filterId) {
            results = results.filter(s => s.codigoEspacio?.toLowerCase().includes(filterId.toLowerCase()));
        }
        if (filterFloor) {
            // El backend puede devolver -1 para Sótano 1
            const pValor = filterFloor === 'S1' ? -1 : parseInt(filterFloor, 10);
            results = results.filter(s => {
                const spV = s.planta?.valor !== undefined ? s.planta.valor : s.planta;
                return spV === pValor;
            });
        }
        if (filterCategory) {
            results = results.filter(s => s.categoriaReserva === filterCategory);
        }
        if (filterCapacity) {
            const minCap = parseInt(filterCapacity, 10);
            results = results.filter(s => {
                const aforoOriginal = s.aforo?.valor !== undefined ? s.aforo.valor : s.aforo;
                // Calculo estricto del frontend o podemos usar el aforo base:
                return aforoOriginal >= minCap;
            });
        }

        setSearchResults(results);

        if (filterFloor) {
            setSelectedFloor(filterFloor);
        }
    }, [filterId, filterFloor, filterCategory, filterCapacity, allSpaces]);

    return (
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar de Filtros y Resultados */}
            <aside className="w-[320px] bg-white border-r border-gray-200 flex flex-col h-full shrink-0 shadow-sm z-10 relative">
                <div className="p-4 flex flex-col h-full overflow-y-auto">
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

                    <h1 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Buscar Espacios</h1>

                    {/* Filtros */}
                    <div className="flex flex-col gap-3 pb-4 border-b border-gray-100">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1" htmlFor="filter-id">Identificador</label>
                            <input
                                id="filter-id"
                                type="text"
                                placeholder="Ej: A-100"
                                value={filterId}
                                onChange={(e) => setFilterId(e.target.value)}
                                className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1" htmlFor="filter-cat">Categoría</label>
                            <select
                                id="filter-cat"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full bg-slate-50 border border-gray-200 rounded-lg px-2 py-2 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                            >
                                {CATEGORY_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1 min-w-0">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1" htmlFor="filter-planta">Planta</label>
                                <select
                                    id="filter-planta"
                                    value={filterFloor}
                                    onChange={(e) => {
                                        setFilterFloor(e.target.value);
                                        setSelectedSpace(null);
                                    }}
                                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-2 py-2 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                                >
                                    {FLOOR_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1 min-w-0">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1" htmlFor="filter-capacity">Aforo (Min)</label>
                                <input
                                    id="filter-capacity"
                                    type="number"
                                    min="0"
                                    placeholder="Ej: 30"
                                    value={filterCapacity}
                                    onChange={(e) => setFilterCapacity(e.target.value)}
                                    className="w-full bg-slate-50 border border-gray-200 rounded-lg px-2 py-2 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Resultados */}
                    <div className="pt-4 flex-1 overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                Resultados ({searchResults.length})
                            </h2>
                            {isSearching && (
                                <span className="text-[10px] text-blue-500 animate-pulse font-medium">Buscando...</span>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 relative">
                            {searchResults.length === 0 && !isSearching && (
                                <div className="text-center py-8 text-xs text-gray-400">
                                    No se encontraron espacios que coincidan con los filtros.
                                </div>
                            )}

                            {searchResults.map((space) => (
                                <div
                                    key={space.codigoEspacio || space.id}
                                    onClick={() => setSelectedSpace(space)}
                                    className={`p-3 border rounded-xl cursor-pointer transition-all ${selectedSpace?.codigoEspacio === space.codigoEspacio ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-xs'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-gray-900 text-sm">{space.codigoEspacio || space.id}</h3>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
                                            Planta {space.planta?.valor !== undefined ? space.planta.valor : space.planta}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 capitalize">{space.nombre || space.tipoFisico?.toLowerCase()}</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Aforo: {space.aforo?.valor !== undefined ? space.aforo.valor : space.aforo}
                                        </div>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${space.esReservable === false ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                            {space.esReservable === false ? 'No reservable' : 'Reservable'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Admin Access Button */}
                    {isManager && (
                        <div className="pt-4 border-t border-gray-100 mt-4">
                            <button 
                                onClick={() => navigate('/admin')}
                                className="w-full py-2 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Gestionar Reservas
                            </button>
                        </div>
                    )}
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
