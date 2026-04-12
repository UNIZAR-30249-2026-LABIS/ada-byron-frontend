import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getUser, logout } from '../services/authService';

// ── Helpers ────────────────────────────────────────────────────────────────────

const ESTADO_META = {
    Pendiente:             { label: 'Pendiente',   bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400' },
    Aceptada:              { label: 'Confirmada',  bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',   dot: 'bg-green-500' },
    Rechazada:             { label: 'Rechazada',   bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500' },
    PotencialmenteInvalida:{ label: 'En revisión', bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-400' },
    Rescindida:            { label: 'Cancelada',   bg: 'bg-slate-100',  text: 'text-slate-500',   border: 'border-slate-200',   dot: 'bg-slate-400' },
};

const isCancellable = (reserva) => {
    if (reserva.estado === 'Rescindida' || reserva.estado === 'Rechazada') return false;
    return new Date(reserva.inicio) > new Date();
};

const isPast = (reserva) => new Date(reserva.fin) < new Date();

const fmt = (iso) => {
    const d = new Date(iso);
    return {
        day:   d.toLocaleDateString('es-ES', { day: '2-digit' }),
        month: d.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase(),
        time:  d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };
};

const fmtRange = (inicio, fin) => {
    const i = new Date(inicio);
    const f = new Date(fin);
    return `${i.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} – ${f.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusBadge({ estado }) {
    const meta = ESTADO_META[estado] ?? { label: estado, bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${meta.bg} ${meta.text} ${meta.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    );
}

function ReservationCard({ reserva, onCancel, cancelling }) {
    const past = isPast(reserva);
    const cancellable = isCancellable(reserva);
    const ini = fmt(reserva.inicio);

    return (
        <div className={`flex items-stretch gap-4 p-5 bg-white rounded-2xl border transition-all duration-200 hover:shadow-md ${
            past ? 'border-gray-100 opacity-60' : 'border-gray-200 shadow-sm hover:border-blue-200'
        } ${reserva.estado === 'Rescindida' ? 'opacity-50' : ''}`}>

            {/* Date badge */}
            <div className={`flex flex-col items-center justify-center min-w-[52px] rounded-xl px-3 py-2 ${past ? 'bg-slate-100' : 'bg-blue-600'}`}>
                <span className={`text-xl font-black leading-none ${past ? 'text-slate-500' : 'text-white'}`}>{ini.day}</span>
                <span className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${past ? 'text-slate-400' : 'text-blue-200'}`}>{ini.month}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm truncate">
                        {reserva.espacioId} – {reserva.nombreEspacio}
                    </h3>
                    <StatusBadge estado={reserva.estado} />
                </div>
                <p className="text-xs text-gray-500 font-medium">
                    {fmtRange(reserva.inicio, reserva.fin)}
                    {reserva.numeroAsistentes && (
                        <span className="ml-3 inline-flex items-center gap-1 text-gray-400">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {reserva.numeroAsistentes} asistentes
                        </span>
                    )}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center">
                {cancellable && (
                    <button
                        id={`cancel-btn-${reserva.id}`}
                        onClick={() => onCancel(reserva)}
                        disabled={cancelling === reserva.id}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {cancelling === reserva.id ? 'Cancelando…' : 'Cancelar reserva'}
                    </button>
                )}
            </div>
        </div>
    );
}

function ConfirmModal({ reserva, onConfirm, onClose, isLoading }) {
    if (!reserva) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center">
                        <svg className="w-7 h-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 mb-1">¿Cancelar esta reserva?</h2>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Vas a cancelar <strong className="text-gray-700">{reserva.espacioId}</strong> del{' '}
                            <strong className="text-gray-700">{fmtRange(reserva.inicio, reserva.fin)}</strong>.
                            Esta acción no se puede deshacer.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full mt-2">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Mantener
                        </button>
                        <button
                            id="confirm-cancel-btn"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 py-3 rounded-xl bg-rose-600 text-sm font-bold text-white hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                </svg>
                            ) : null}
                            Sí, cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function MisReservas() {
    const navigate    = useNavigate();
    const user        = getUser();

    const [reservas,    setReservas]    = useState([]);
    const [isLoading,   setIsLoading]   = useState(true);
    const [error,       setError]       = useState(null);
    const [cancelling,  setCancelling]  = useState(null); // id being cancelled
    const [toCancel,    setToCancel]    = useState(null); // reserva pending confirmation
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [toast,       setToast]       = useState(null);  // { type, msg }

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchReservas = useCallback(async () => {
        try {
            setError(null);
            const res = await api.get('users/me/reservations');
            setReservas(res.data);
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                logout();
                navigate('/login');
            } else {
                setError('No se pudieron cargar tus reservas. Inténtalo de nuevo.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => { fetchReservas(); }, [fetchReservas]);

    const handleCancelRequest = (reserva) => setToCancel(reserva);
    const handleModalClose = () => setToCancel(null);

    const handleConfirmCancel = async () => {
        if (!toCancel) return;
        setIsModalLoading(true);
        setCancelling(toCancel.id);
        try {
            await api.delete(`users/me/reservations/${toCancel.id}/cancel`);
            setToCancel(null);
            showToast('success', 'Reserva cancelada correctamente.');
            await fetchReservas();
        } catch (err) {
            const msg = err.response?.data ?? 'Error al cancelar la reserva.';
            showToast('error', msg);
        } finally {
            setIsModalLoading(false);
            setCancelling(null);
        }
    };

    const proximas = reservas.filter(r => !isPast(r) && r.estado !== 'Rescindida');
    const pasadas  = reservas.filter(r => isPast(r) || r.estado === 'Rescindida');

    const activeCount = proximas.filter(r => r.estado === 'Aceptada' || r.estado === 'Pendiente').length;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* ── Navbar ─────────────────────────────────────────────────────── */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                            <span className="text-white text-xs font-black">AB</span>
                        </div>
                        <span className="font-bold text-gray-900 text-sm tracking-tight">Ada Byron</span>
                    </div>
                    <nav className="flex items-center gap-5">
                        <button
                            onClick={() => navigate('/mapa')}
                            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Mapa
                        </button>
                        <span className="text-sm font-bold text-gray-900 border-b-2 border-blue-600 pb-0.5">
                            Mis Reservas
                        </span>
                        {user?.rol === 'Gerente' && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Gestionar Reservas
                            </button>
                        )}
                        <button
                            id="logout-btn"
                            onClick={() => { logout(); navigate('/login'); }}
                            className="text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors"
                        >
                            Salir
                        </button>
                    </nav>
                </div>
            </header>

            {/* ── Toast ──────────────────────────────────────────────────────── */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-3 transition-all animate-in slide-in-from-top-3 ${
                    toast.type === 'success'
                        ? 'bg-green-600 text-white'
                        : 'bg-rose-600 text-white'
                }`}>
                    {toast.type === 'success'
                        ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                        : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                    }
                    {toast.msg}
                </div>
            )}

            {/* ── Body ───────────────────────────────────────────────────────── */}
            <main className="max-w-3xl mx-auto px-5 py-10">

                {/* Header */}
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Panel Personal</p>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Hola, {user?.nombreCompleto?.split(' ')[0] ?? 'Usuario'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">
                            {activeCount > 0
                                ? `Tienes ${activeCount} reserva${activeCount !== 1 ? 's' : ''} activa${activeCount !== 1 ? 's' : ''} esta semana.`
                                : 'No tienes reservas activas próximas.'}
                        </p>
                    </div>
                    <button
                        id="nueva-reserva-btn"
                        onClick={() => navigate('/buscar')}
                        className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-colors shadow-lg"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
                        </svg>
                        Nueva Reserva
                    </button>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col gap-3">
                        {[1,2,3].map(i => (
                            <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Error */}
                {!isLoading && error && (
                    <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
                        <p className="text-rose-600 font-semibold text-sm mb-3">{error}</p>
                        <button
                            onClick={fetchReservas}
                            className="text-xs font-bold text-rose-600 hover:underline"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Content */}
                {!isLoading && !error && (
                    <>
                        {/* Sección Próximas */}
                        {proximas.length > 0 && (
                            <section className="mb-10">
                                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                                    Próximas
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {proximas.map(r => (
                                        <ReservationCard
                                            key={r.id}
                                            reserva={r}
                                            onCancel={handleCancelRequest}
                                            cancelling={cancelling}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Sección Pasadas */}
                        {pasadas.length > 0 && (
                            <section>
                                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                                    Pasadas
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {pasadas.map(r => (
                                        <ReservationCard
                                            key={r.id}
                                            reserva={r}
                                            onCancel={handleCancelRequest}
                                            cancelling={cancelling}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Empty state */}
                        {reservas.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-700 mb-1">Sin reservas aún</p>
                                    <p className="text-sm text-gray-400">Busca un espacio disponible para hacer tu primera reserva.</p>
                                </div>
                                <button
                                    onClick={() => navigate('/buscar')}
                                    className="mt-2 px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    Explorar espacios
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* ── Confirmation Modal ─────────────────────────────────────────── */}
            <ConfirmModal
                reserva={toCancel}
                onConfirm={handleConfirmCancel}
                onClose={handleModalClose}
                isLoading={isModalLoading}
            />
        </div>
    );
}
