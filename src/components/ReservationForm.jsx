import { useMemo, useState } from 'react';
import { createReservation } from '../services/api';
import { getUser } from '../services/authService';

export default function ReservationForm({ selectedSpace, onClose }) {
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);
    const [form, setForm] = useState({
        uso: '',
        attendeeCount: 1,
        fecha: today,
        horaInicio: '',
        horaFin: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'attendeeCount' ? Number(value) : value,
        }));
    };

    const validateForm = () => {
        if (!selectedSpace) return 'Debes seleccionar un espacio en el mapa.';
        if (!form.fecha || !form.horaInicio || !form.horaFin) return 'Indica fecha, hora inicio y fin.';
        if (form.attendeeCount <= 0) return 'Los asistentes deben ser mayor que 0.';

        const inicio = new Date(`${form.fecha}T${form.horaInicio}`);
        const fin = new Date(`${form.fecha}T${form.horaFin}`);
        if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) return 'Las horas introducidas no son válidas.';
        if (fin <= inicio) return 'La hora de fin debe ser posterior a la de inicio.';

        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        const user = getUser();
        if (!user || !user.email) {
            setError('No has iniciado sesión o tu sesión caducó.');
            return;
        }

        const payload = {
            requesterEmail: user.email,
            spaceId: selectedSpace.id_espacio ?? selectedSpace.idEspacio ?? selectedSpace.id,
            startTime: new Date(`${form.fecha}T${form.horaInicio}`).toISOString(),
            endTime: new Date(`${form.fecha}T${form.horaFin}`).toISOString(),
            attendeeCount: form.attendeeCount,
        };
        
        if (form.uso) {
            payload.uso = form.uso; 
        }

        setIsSubmitting(true);
        try {
            await createReservation(payload);
            setSuccess('Reserva confirmada.');
            setTimeout(() => { if(onClose) onClose(); }, 2000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.message || 'Error al crear reserva.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 w-[280px] relative overflow-hidden backdrop-blur-sm">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-[14px] font-bold text-gray-900 m-0 tracking-tight">Reservar Sala</h2>
                {onClose && (
                    <button 
                        onClick={onClose}
                        type="button"
                        className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors p-[4px] rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {selectedSpace ? (
                <div className="mb-4 px-3 py-2.5 bg-slate-50/80 rounded-lg border border-slate-200/60 shadow-inner">
                    <div className="text-[13px] font-bold text-gray-900 mb-0.5 leading-tight truncate">
                        {selectedSpace.nombre || selectedSpace.name || 'Espacio seleccionado'}
                    </div>
                    <div className="text-[10px] text-gray-400 mb-2 font-mono truncate">
                        ID: {selectedSpace.id_espacio || selectedSpace.idEspacio || selectedSpace.id || 'N/A'}
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[9px] uppercase tracking-wider">
                        <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-bold shadow-sm">
                            {selectedSpace.uso || 'Genérico'}
                        </span>
                        <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-bold shadow-sm">
                            P.{selectedSpace.altura || selectedSpace.floor || 'X'}
                        </span>
                    </div>
                </div>
            ) : (
                <p className="text-xs text-gray-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                    Selecciona una sala.
                </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Motivo / Uso (Opcional)
                    </label>
                    <input
                        type="text"
                        name="uso"
                        value={form.uso}
                        onChange={handleChange}
                        placeholder="Reunión..."
                        className="w-full bg-slate-50/50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Asistentes
                    </label>
                    <input
                        type="number"
                        min="1"
                        name="attendeeCount"
                        value={form.attendeeCount}
                        onChange={handleChange}
                        className="w-full bg-slate-50/50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Fecha
                    </label>
                    <input
                        type="date"
                        name="fecha"
                        value={form.fecha}
                        onChange={handleChange}
                        className="w-full bg-slate-50/50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                    />
                </div>

                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Inicio
                        </label>
                        <input
                            type="time"
                            name="horaInicio"
                            value={form.horaInicio}
                            onChange={handleChange}
                            className="w-full bg-slate-50/50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Fin
                        </label>
                        <input
                            type="time"
                            name="horaFin"
                            value={form.horaFin}
                            onChange={handleChange}
                            className="w-full bg-slate-50/50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-2 bg-red-50 text-red-700 border border-red-100 rounded-lg text-[10px] font-semibold shadow-sm flex items-start gap-1.5 leading-tight">
                        <svg className="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-2 bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] rounded-lg text-[10px] font-semibold shadow-sm flex items-start gap-1.5 leading-tight">
                        <svg className="w-3.5 h-3.5 text-[#22c55e] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {success}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!selectedSpace || isSubmitting}
                    className="w-full mt-1.5 py-2.5 bg-[#2563eb] text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-1.5">
                            <svg className="animate-spin h-3.5 w-3.5 text-white/70" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Confirmando...
                        </span>
                    ) : 'Confirmar Reserva'}
                </button>
            </form>
        </div>
    );
}