import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { getUser, logout as authLogout } from '../services/authService';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
    { value: '', label: 'Cualquier categoría' },
    { value: 'Aula', label: 'Aula' },
    { value: 'Laboratorio', label: 'Laboratorio' },
    { value: 'Seminario', label: 'Seminario' },
    { value: 'SalaComun', label: 'Sala Común' },
    { value: 'Despacho', label: 'Despacho' },
];

const CATEGORY_EDIT_OPTIONS = [
    { value: 'Aula', label: 'Aula' },
    { value: 'Laboratorio', label: 'Laboratorio' },
    { value: 'Seminario', label: 'Seminario' },
    { value: 'SalaComun', label: 'Sala Común' },
    { value: 'Despacho', label: 'Despacho' },
];

const FLOOR_OPTIONS = [
    { value: '', label: 'Cualquier planta' },
    { value: '-1', label: 'Sótano 1' },
    { value: '0', label: 'Planta Baja' },
    { value: '1', label: 'Planta 1' },
    { value: '2', label: 'Planta 2' },
    { value: '3', label: 'Planta 3' },
    { value: '4', label: 'Planta 4' },
    { value: '5', label: 'Planta 5' },
];

const FLOOR_EDIT_OPTIONS = [
    { value: '-1', label: 'Sótano 1' },
    { value: '0', label: 'Planta Baja' },
    { value: '1', label: 'Planta 1' },
    { value: '2', label: 'Planta 2' },
    { value: '3', label: 'Planta 3' },
    { value: '4', label: 'Planta 4' },
    { value: '5', label: 'Planta 5' },
];

const TABS = [
    { id: 'reservas', label: 'Reservas' },
    { id: 'espacios', label: 'Espacios' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: category badge
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIA_STYLE = {
    Aula:       { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
    Laboratorio:{ bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    Seminario:  { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200' },
    SalaComun:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
    Despacho:   { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
};

function CategoryBadge({ category }) {
    const style = CATEGORIA_STYLE[category] ?? { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
    const label = category === 'SalaComun' ? 'Sala Común' : (category ?? '—');
    return (
        <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full border ${style.bg} ${style.text} ${style.border}`}>
            {label}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit Space Modal
// ─────────────────────────────────────────────────────────────────────────────

function validate(form) {
    const errors = {};
    if (!form.nombre.trim())
        errors.nombre = 'La designación no puede estar vacía.';
    else if (form.nombre.trim().length > 200)
        errors.nombre = 'Máximo 200 caracteres.';
    const cap = parseInt(form.aforo, 10);
    if (isNaN(cap) || cap <= 0)
        errors.aforo = 'El aforo debe ser un número mayor que 0.';
    if (!form.categoria)
        errors.categoria = 'Selecciona una categoría.';
    return errors;
}

function EditSpaceModal({ espacio, onClose, onSaved }) {
    const [form, setForm] = useState({
        nombre:   espacio.nombre ?? '',
        aforo:    String(espacio.aforo?.valor ?? espacio.aforo ?? ''),
        planta:   String(espacio.planta?.valor ?? espacio.planta ?? '0'),
        categoria: espacio.categoriaReserva ?? espacio.tipoFisico ?? 'Aula',
    });
    const [errors,    setErrors]    = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverErr, setServerErr] = useState(null);

    const handleChange = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        setErrors(e => { const ne = { ...e }; delete ne[field]; return ne; });
        setServerErr(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setIsLoading(true);
        try {
            await api.put(`Admin/spaces/${encodeURIComponent(espacio.codigoEspacio)}`, {
                nombre:   form.nombre.trim(),
                aforo:    parseInt(form.aforo, 10),
                planta:   parseInt(form.planta, 10),
                categoria: form.categoria,
            });
            onSaved();
        } catch (err) {
            const data = err.response?.data;
            let errMsg = 'Error al actualizar el espacio.';
            if (typeof data === 'string') errMsg = data;
            else if (data?.title) errMsg = data.detail ? `${data.title}: ${data.detail}` : data.title;
            else if (data?.message) errMsg = data.message;
            setServerErr(errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-7 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Editar Espacio</p>
                            <h2 className="text-white text-xl font-black">{espacio.codigoEspacio}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5" noValidate>
                    {/* Nombre */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5" htmlFor="edit-nombre">
                            Designación
                        </label>
                        <input
                            id="edit-nombre"
                            type="text"
                            value={form.nombre}
                            onChange={e => handleChange('nombre', e.target.value)}
                            maxLength={200}
                            placeholder="Ej: Aula Magna Planta 1"
                            className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                                errors.nombre ? 'border-rose-400 bg-rose-50' : 'border-gray-200'
                            }`}
                        />
                        {errors.nombre && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.nombre}</p>}
                    </div>

                    {/* Aforo + Planta side by side */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5" htmlFor="edit-aforo">
                                Aforo (personas)
                            </label>
                            <input
                                id="edit-aforo"
                                type="number"
                                min="1"
                                max="999"
                                value={form.aforo}
                                onChange={e => handleChange('aforo', e.target.value)}
                                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                                    errors.aforo ? 'border-rose-400 bg-rose-50' : 'border-gray-200'
                                }`}
                            />
                            {errors.aforo && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.aforo}</p>}
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5" htmlFor="edit-planta">
                                Planta
                            </label>
                            <select
                                id="edit-planta"
                                value={form.planta}
                                onChange={e => handleChange('planta', e.target.value)}
                                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 appearance-none cursor-pointer"
                            >
                                {FLOOR_EDIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5" htmlFor="edit-categoria">
                            Categoría de Reserva
                        </label>
                        <select
                            id="edit-categoria"
                            value={form.categoria}
                            onChange={e => handleChange('categoria', e.target.value)}
                            className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 appearance-none cursor-pointer ${
                                errors.categoria ? 'border-rose-400 bg-rose-50' : 'border-gray-200'
                            }`}
                        >
                            {CATEGORY_EDIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        {errors.categoria && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.categoria}</p>}
                    </div>

                    {/* Server Error */}
                    {serverErr && (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">
                            {serverErr}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            id="save-space-btn"
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-3 rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {isLoading
                                ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                : null
                            }
                            Guardar cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reservas Tab
// ─────────────────────────────────────────────────────────────────────────────

function ReservasTab({ reservations, isLoading, onRescind, onRefresh }) {
    const [filterCategory, setFilterCategory] = useState('');
    const [filterFloor,    setFilterFloor]    = useState('');
    const [search,         setSearch]         = useState('');

    const filtered = reservations.filter(res => {
        const matchSearch   = search === '' || res.espacioId?.toLowerCase().includes(search.toLowerCase()) || res.solicitante?.toLowerCase().includes(search.toLowerCase()) || res.nombreEspacio?.toLowerCase().includes(search.toLowerCase());
        const matchCategory = filterCategory === '' || res.nombreEspacio?.toLowerCase().includes(filterCategory.toLowerCase());
        const matchFloor    = filterFloor === '' || res.espacioId?.includes(`.${filterFloor}.`) || res.espacioId?.startsWith(`${filterFloor}.`);
        return matchSearch && matchCategory && matchFloor;
    });

    return (
        <div className="flex gap-6 h-full">
            {/* Sidebar */}
            <aside className="w-56 shrink-0 hidden lg:block">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filtros</h3>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Búsqueda</label>
                        <input
                            type="text"
                            placeholder="Espacio o solicitante…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Categoría</label>
                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                            {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Planta</label>
                        <select value={filterFloor} onChange={e => setFilterFloor(e.target.value)}
                            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                            {FLOOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-[10px] text-blue-700 font-semibold leading-relaxed">Mostrando reservas activas con fin posterior a ahora.</p>
                    </div>
                </div>
            </aside>

            {/* Table */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Estado de la Ocupación</h2>
                        <p className="text-sm text-gray-500">{filtered.length} reservas en tiempo real</p>
                    </div>
                    <button onClick={onRefresh} title="Refrescar"
                        className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors shadow-sm">
                        <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                    </button>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Espacio</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Solicitante</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Horario</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Estado</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-3 bg-slate-50 rounded-full">
                                                <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                                                </svg>
                                            </div>
                                            <span className="text-gray-400 text-sm font-medium">No hay reservas activas</span>
                                        </div>
                                    </td></tr>
                                ) : filtered.map(res => (
                                    <tr key={res.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{res.espacioId}</span>
                                                <span className="text-[11px] text-gray-500">{res.nombreEspacio}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-semibold text-gray-700">{res.solicitante}</td>
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-bold text-gray-700">
                                                {new Date(res.inicio).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} –{' '}
                                                {new Date(res.fin).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {(res.esPotencialmenteInvalida || res.estado === 'PotencialmenteInvalida') ? (
                                                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full border border-amber-200 uppercase">Sospechosa</span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full border border-green-200 uppercase">Válida</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => onRescind(res.id)}
                                                className="px-4 py-2 bg-rose-50 text-rose-600 text-[11px] font-bold rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all hover:scale-105"
                                            >
                                                Anular
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total Activas', value: filtered.length, color: 'text-gray-900' },
                        { label: 'En Revisión',   value: filtered.filter(r => r.esPotencialmenteInvalida).length, color: 'text-amber-500' },
                        { label: 'Aulas Libres',  value: '—', color: 'text-blue-600' },
                    ].map(stat => (
                        <div key={stat.label} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{stat.label}</span>
                            <span className={`text-3xl font-black ${stat.color}`}>{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Espacios Tab
// ─────────────────────────────────────────────────────────────────────────────

function EspaciosTab({ onToast }) {
    const [spaces,        setSpaces]        = useState([]);
    const [isLoading,     setIsLoading]     = useState(true);
    const [editTarget,    setEditTarget]    = useState(null);
    const [filterSearch,  setFilterSearch]  = useState('');
    const [filterCategory,setFilterCategory]= useState('');
    const [filterFloor,   setFilterFloor]   = useState('');

    const fetchSpaces = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get('spaces');
            setSpaces(res.data);
        } catch {
            onToast('error', 'Error al cargar los espacios.');
        } finally {
            setIsLoading(false);
        }
    }, [onToast]);

    useEffect(() => { fetchSpaces(); }, [fetchSpaces]);

    const handleSaved = () => {
        setEditTarget(null);
        onToast('success', 'Espacio actualizado correctamente.');
        fetchSpaces();
    };

    const getFloorVal = (s) => s.planta?.valor ?? s.planta;

    const filtered = spaces.filter(s => {
        const q = filterSearch.toLowerCase();
        const matchSearch   = q === '' || s.codigoEspacio?.toLowerCase().includes(q) || s.nombre?.toLowerCase().includes(q);
        const matchCategory = filterCategory === '' || (s.categoriaReserva === filterCategory || s.tipoFisico === filterCategory);
        const floorVal      = String(getFloorVal(s));
        const matchFloor    = filterFloor === '' || floorVal === filterFloor;
        return matchSearch && matchCategory && matchFloor;
    });

    return (
        <div>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex-1 min-w-[180px]">
                    <input
                        id="spaces-search"
                        type="text"
                        placeholder="Buscar por código o nombre…"
                        value={filterSearch}
                        onChange={e => setFilterSearch(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                    />
                </div>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm">
                    {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select value={filterFloor} onChange={e => setFilterFloor(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm">
                    {FLOOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <span className="text-xs text-gray-400 font-medium ml-auto">{filtered.length} espacios</span>
                <button onClick={fetchSpaces} title="Refrescar"
                    className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors shadow-sm">
                    <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Código</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Designación</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Planta</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Aforo</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(6)].map((__, j) => (
                                            <td key={j} className="px-6 py-4">
                                                <div className="h-4 bg-slate-100 rounded-full animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                                    No se encontraron espacios con los filtros actuales.
                                </td></tr>
                            ) : filtered.map(s => {
                                const floorLabel = FLOOR_EDIT_OPTIONS.find(o => o.value === String(getFloorVal(s)))?.label
                                    ?? `Planta ${getFloorVal(s)}`;
                                const aforo = s.aforo?.valor ?? s.aforo;
                                const cat   = s.categoriaReserva ?? s.tipoFisico;
                                return (
                                    <tr key={s.codigoEspacio} className="hover:bg-slate-50/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-gray-900 font-mono">{s.codigoEspacio}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-700">{s.nombre}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs font-bold text-gray-600 bg-slate-100 px-2 py-1 rounded-full">{floorLabel}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-bold text-gray-800">{aforo}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <CategoryBadge category={cat} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                id={`edit-space-${s.codigoEspacio}`}
                                                onClick={() => setEditTarget(s)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all hover:scale-105"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                                </svg>
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editTarget && (
                <EditSpaceModal
                    espacio={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main AdminDashboard
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const navigate = useNavigate();
    const user     = getUser();

    const [activeTab,    setActiveTab]    = useState('reservas');
    const [reservations, setReservations] = useState([]);
    const [isLoading,    setIsLoading]    = useState(true);
    const [toast,        setToast]        = useState(null);

    const showToast = useCallback((type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    }, []);

    const fetchReservations = useCallback(async () => {
        try {
            const res = await api.get('admin/reservations/live');
            setReservations(res.data);
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchReservations();
        const interval = setInterval(fetchReservations, 30000);
        return () => clearInterval(interval);
    }, [fetchReservations]);

    const handleRescind = async (id) => {
        if (!id) return;
        if (!window.confirm(`¿Anular definitivamente la reserva ${id}?`)) return;
        try {
            await api.delete(`Admin/reservations/${id}`);
            showToast('success', 'Reserva anulada. Usuario notificado vía SignalR.');
            fetchReservations();
        } catch (err) {
            const data = err.response?.data;
            let errMsg = 'Error al anular la reserva.';
            if (typeof data === 'string') errMsg = data;
            else if (data?.detail) errMsg = data.detail;
            else if (data?.title) errMsg = data.title;
            else if (data?.message) errMsg = data.message;

            showToast('error', errMsg);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* ── Header ───────────────────────────────────────────────────── */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-20 shadow-sm sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-gray-900 leading-tight">Panel de Administración</h1>
                        <p className="text-xs text-gray-500">
                            {user?.nombreCompleto ?? 'Gerente'} · <span className="text-blue-600 font-semibold">Gerente</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                        <span className="text-[11px] font-bold text-green-700 uppercase tracking-tight">Sistema Online</span>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                        {TABS.map(t => (
                            <button
                                key={t.id}
                                id={`tab-${t.id}`}
                                onClick={() => setActiveTab(t.id)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    activeTab === t.id
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 border-l border-gray-200 pl-4 ml-2">
                        <button
                            onClick={() => navigate('/mapa')}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            Volver al mapa
                        </button>
                        <button
                            onClick={() => { authLogout(); navigate('/login'); }}
                            className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Toast ────────────────────────────────────────────────────── */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-3 ${
                    toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                    {toast.type === 'success'
                        ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                        : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                    }
                    {toast.msg}
                </div>
            )}

            {/* ── Content ──────────────────────────────────────────────────── */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {activeTab === 'reservas' && (
                        <ReservasTab
                            reservations={reservations}
                            isLoading={isLoading}
                            onRescind={handleRescind}
                            onRefresh={fetchReservations}
                        />
                    )}
                    {activeTab === 'espacios' && (
                        <EspaciosTab onToast={showToast} />
                    )}
                </div>
            </main>
        </div>
    );
}
