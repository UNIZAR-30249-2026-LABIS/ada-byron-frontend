import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { getUser, logout as authLogout } from '../services/authService';
import toast from 'react-hot-toast';

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
    { id: 'reservas',       label: 'Reservas' },
    { id: 'espacios',       label: 'Espacios' },
    { id: 'staff',          label: 'Staff' },
    { id: 'configuracion',  label: 'Configuración' },
];

const ROLE_OPTIONS = [
    { value: 'Estudiante', label: 'Estudiante' },
    { value: 'InvestigadorContratado', label: 'Investigador contratado' },
    { value: 'DocenteInvestigador', label: 'Docente-investigador' },
    { value: 'Conserje', label: 'Conserje' },
    { value: 'TecnicoLaboratorio', label: 'Técnico laboratorio' },
    { value: 'Gerente', label: 'Gerente' },
];

const DEPARTMENT_OPTIONS = [
    { value: '', label: 'Sin departamento' },
    { value: 'Informática', label: 'Informática' },
    { value: 'Ing. de Sistemas e Ing. Electrónica y Comunicaciones', label: 'Ing. Sistemas e Ing. Electrónica y Comunicaciones' },
];

function getAssignmentOptions(categoria) {
    switch (categoria) {
        case 'Aula':
        case 'SalaComun':
            return [{ value: 'Eina', label: 'EINA (acceso general)' }];
        case 'Seminario':
        case 'Laboratorio':
            return [
                { value: 'Eina', label: 'EINA (acceso general)' },
                { value: 'Departamento', label: 'Departamento' },
            ];
        case 'Despacho':
            return [
                { value: 'Departamento', label: 'Departamento' },
                { value: 'Personas', label: 'Personas específicas' },
            ];
        default:
            return [
                { value: 'Eina', label: 'EINA (acceso general)' },
                { value: 'Departamento', label: 'Departamento' },
                { value: 'Personas', label: 'Personas específicas' },
            ];
    }
}

function defaultAssignmentForCategoria(categoria) {
    switch (categoria) {
        case 'Aula':
        case 'SalaComun':
        case 'Seminario':
        case 'Laboratorio':
            return 'Eina';
        case 'Despacho':
            return 'Departamento';
        default:
            return 'Eina';
    }
}

const WEEK_DAYS = [
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' },
    { value: 0, label: 'Dom' },
];

function createDefaultSchedule() {
    return WEEK_DAYS.map(day => ({
        diaSemana: day.value,
        activo: true,
        horaInicio: '00:00',
        horaFin: '23:59',
    }));
}

function normalizeSchedule(schedule) {
    const incoming = Array.isArray(schedule) ? schedule : [];
    return WEEK_DAYS.map(day => {
        const found = incoming.find(item => item.diaSemana === day.value);
        return {
            diaSemana: day.value,
            activo: found?.activo ?? true,
            horaInicio: found?.horaInicio ?? '00:00',
            horaFin: found?.horaFin ?? '23:59',
        };
    });
}

function emptyStaffForm() {
    return {
        email: '',
        nombre: '',
        apellidos: '',
        rol: 'Estudiante',
        departamento: '',
        esGerente: false,
    };
}

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

function StaffRoleBadge({ role, esGerente }) {
    const tone = {
        Gerente: 'bg-blue-50 text-blue-700 border-blue-200',
        DocenteInvestigador: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        InvestigadorContratado: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        TecnicoLaboratorio: 'bg-violet-50 text-violet-700 border-violet-200',
        Conserje: 'bg-amber-50 text-amber-700 border-amber-200',
        Estudiante: 'bg-slate-100 text-slate-700 border-slate-200',
    }[role] ?? 'bg-slate-100 text-slate-700 border-slate-200';

    const baseLabel = ROLE_OPTIONS.find(option => option.value === role)?.label ?? role;
    const label = esGerente && role !== 'Gerente' ? `${baseLabel} + Gerente` : baseLabel;
    return (
        <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full border ${tone}`}>
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
    if (form.esReservable && !form.horarioReserva.some(day => day.activo))
        errors.horarioReserva = 'Un espacio reservable debe tener al menos un día activo.';
    form.horarioReserva.forEach(day => {
        if (day.activo && day.horaInicio >= day.horaFin)
            errors.horarioReserva = 'Cada día activo debe tener una hora de inicio anterior a la de fin.';
    });
    // PBI-12: porcentaje específico
    if (form.porcentajeEspecifico !== '' && form.porcentajeEspecifico !== null) {
        const pct = parseFloat(form.porcentajeEspecifico);
        if (isNaN(pct) || pct < 0 || pct > 100)
            errors.porcentajeEspecifico = 'El porcentaje debe ser un número entre 0 y 100.';
    }
    // HU-09: asignación del espacio
    const allowedAssignment = getAssignmentOptions(form.categoria);
    if (!allowedAssignment.some(o => o.value === form.tipoAsignacion))
        errors.tipoAsignacion = `La categoría '${form.categoria}' no admite el tipo de asignación seleccionado.`;
    if (form.tipoAsignacion === 'Departamento' && !form.departamentoAsignado)
        errors.departamentoAsignado = 'Selecciona un departamento válido.';
    if (form.tipoAsignacion === 'Personas') {
        const personas = form.personasAsignadas.split('\n').map(s => s.trim()).filter(Boolean);
        if (personas.length === 0)
            errors.personasAsignadas = 'Especifica al menos una persona (un email por línea).';
    }
    return errors;
}

function EditSpaceModal({ espacio, onClose, onSaved }) {
    const isPhysicalDespacho = (espacio.tipoFisico ?? espacio.categoriaReserva) === 'Despacho';
    const initialCategoria = espacio.categoriaReserva ?? espacio.tipoFisico ?? 'Aula';
    const [form, setForm] = useState({
        nombre:   espacio.nombre ?? '',
        aforo:    String(espacio.aforo?.valor ?? espacio.aforo ?? ''),
        planta:   String(espacio.planta?.valor ?? espacio.planta ?? '0'),
        categoria: initialCategoria,
        esReservable: isPhysicalDespacho ? false : (espacio.esReservable ?? true),
        horarioReserva: normalizeSchedule(espacio.horarioReserva ?? createDefaultSchedule()),
        // PBI-12: porcentaje específico ('' = campo vacío → heredar del edificio)
        porcentajeEspecifico: espacio.porcentajeOcupacionEspecifico != null
            ? String(espacio.porcentajeOcupacionEspecifico)
            : '',
        // HU-09: asignación del espacio
        tipoAsignacion: espacio.tipoAsignacion ?? defaultAssignmentForCategoria(initialCategoria),
        departamentoAsignado: (!espacio.departamento?.isNull && espacio.departamento?.nombre)
            ? espacio.departamento.nombre
            : '',
        personasAsignadas: Array.isArray(espacio.personasAsignadas)
            ? espacio.personasAsignadas.join('\n')
            : '',
    });
    const [errors,    setErrors]    = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverErr, setServerErr] = useState(null);

    const handleChange = (field, value) => {
        setForm(f => {
            const next = { ...f, [field]: value };
            if (field === 'categoria') {
                const allowedOptions = getAssignmentOptions(value);
                const currentIsAllowed = allowedOptions.some(o => o.value === next.tipoAsignacion);
                if (!currentIsAllowed) next.tipoAsignacion = allowedOptions[0].value;
            }
            return next;
        });
        setErrors(e => { const ne = { ...e }; delete ne[field]; return ne; });
        setServerErr(null);
    };

    const handleScheduleChange = (diaSemana, field, value) => {
        setForm(current => ({
            ...current,
            horarioReserva: current.horarioReserva.map(day =>
                day.diaSemana === diaSemana ? { ...day, [field]: value } : day
            ),
        }));
        setErrors(current => {
            const next = { ...current };
            delete next.horarioReserva;
            return next;
        });
        setServerErr(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setIsLoading(true);
        try {
            // 1. Actualizar los datos principales del espacio (incluyendo asignación HU-09)
            await api.put(`Admin/spaces/${encodeURIComponent(espacio.codigoEspacio)}`, {
                nombre:   form.nombre.trim(),
                aforo:    parseInt(form.aforo, 10),
                planta:   parseInt(form.planta, 10),
                categoria: form.categoria,
                esReservable: isPhysicalDespacho ? false : form.esReservable,
                horarioReserva: form.horarioReserva,
                tipoAsignacion: form.tipoAsignacion,
                departamentoAsignado: form.tipoAsignacion === 'Departamento' ? form.departamentoAsignado : null,
                personasAsignadas: form.tipoAsignacion === 'Personas'
                    ? form.personasAsignadas.split('\n').map(s => s.trim()).filter(Boolean)
                    : [],
            });

            // 2. PBI-12: Actualizar el porcentaje específico (endpoint dedicado)
            const pctValue = form.porcentajeEspecifico === '' ? null : parseFloat(form.porcentajeEspecifico);
            await api.patch(
                `Admin/spaces/${encodeURIComponent(espacio.codigoEspacio)}/aforo-especifico`,
                { porcentajeEspecifico: pctValue }
            );

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
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden">
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
                <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5 max-h-[80vh] overflow-y-auto" noValidate>
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

                    {/* ── HU-09: Asignación del espacio ───────────────────────── */}
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 space-y-3">
                        <div>
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Asignación del Espacio (HU-09)</p>
                            <p className="text-sm font-semibold text-gray-800">Define a quién pertenece o quién puede usar este espacio.</p>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Tipo de Asignación</label>
                            <select
                                value={form.tipoAsignacion}
                                onChange={e => handleChange('tipoAsignacion', e.target.value)}
                                className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 appearance-none cursor-pointer ${
                                    errors.tipoAsignacion ? 'border-rose-400 bg-rose-50' : 'border-gray-200'
                                }`}
                            >
                                {getAssignmentOptions(form.categoria).map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                            {errors.tipoAsignacion && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.tipoAsignacion}</p>}
                        </div>
                        {form.tipoAsignacion === 'Departamento' && (
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Departamento</label>
                                <select
                                    value={form.departamentoAsignado}
                                    onChange={e => handleChange('departamentoAsignado', e.target.value)}
                                    className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 appearance-none cursor-pointer ${
                                        errors.departamentoAsignado ? 'border-rose-400 bg-rose-50' : 'border-gray-200'
                                    }`}
                                >
                                    <option value="">Selecciona un departamento…</option>
                                    {DEPARTMENT_OPTIONS.filter(d => d.value).map(d => (
                                        <option key={d.value} value={d.value}>{d.label}</option>
                                    ))}
                                </select>
                                {errors.departamentoAsignado && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.departamentoAsignado}</p>}
                            </div>
                        )}
                        {form.tipoAsignacion === 'Personas' && (
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                                    Personas asignadas <span className="text-gray-400 normal-case font-normal">(un email por línea)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={form.personasAsignadas}
                                    onChange={e => handleChange('personasAsignadas', e.target.value)}
                                    placeholder="usuario@unizar.es&#10;otro@unizar.es"
                                    className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 resize-none ${
                                        errors.personasAsignadas ? 'border-rose-400 bg-rose-50' : 'border-gray-200'
                                    }`}
                                />
                                {errors.personasAsignadas && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.personasAsignadas}</p>}
                            </div>
                        )}
                    </div>

                    {/* ── PBI-12: Porcentaje de ocupación específico ───────────── */}
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">
                                    Aforo Específico (PBI-12)
                                </p>
                                <p className="text-sm font-semibold text-gray-800">
                                    Porcentaje de uso máximo para este espacio.
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Déjalo vacío para heredar el porcentaje global del edificio.
                                </p>
                            </div>
                            {form.porcentajeEspecifico === '' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-[11px] font-bold uppercase tracking-wide shrink-0">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                                    </svg>
                                    Heredado del edificio
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-700 text-[11px] font-bold uppercase tracking-wide shrink-0">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                    </svg>
                                    Específico del espacio
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                id="edit-porcentaje-especifico"
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={form.porcentajeEspecifico}
                                onChange={e => handleChange('porcentajeEspecifico', e.target.value)}
                                placeholder="Ej: 75  (vacío = heredar del edificio)"
                                className={`flex-1 bg-white border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 ${
                                    errors.porcentajeEspecifico ? 'border-rose-400 bg-rose-50' : 'border-gray-200'
                                }`}
                            />
                            <span className="text-sm font-bold text-gray-400 shrink-0">%</span>
                            {form.porcentajeEspecifico !== '' && (
                                <button
                                    type="button"
                                    onClick={() => handleChange('porcentajeEspecifico', '')}
                                    title="Eliminar porcentaje específico (heredar del edificio)"
                                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-gray-400 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            )}
                        </div>
                        {errors.porcentajeEspecifico && (
                            <p className="text-rose-500 text-xs font-medium">{errors.porcentajeEspecifico}</p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-slate-50/70 p-4 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Reservabilidad</p>
                                <p className="text-sm font-semibold text-gray-800">Controla si el espacio admite reservas puntuales.</p>
                            </div>
                            <label className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border text-sm font-semibold ${
                                isPhysicalDespacho
                                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-white border-gray-200 text-gray-700 cursor-pointer'
                            }`}>
                                <input
                                    type="checkbox"
                                    checked={isPhysicalDespacho ? false : form.esReservable}
                                    disabled={isPhysicalDespacho}
                                    onChange={e => handleChange('esReservable', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                {isPhysicalDespacho ? 'Despacho no reservable' : (form.esReservable ? 'Reservable' : 'No reservable')}
                            </label>
                        </div>
                        {isPhysicalDespacho && (
                            <p className="text-xs text-amber-700 font-medium">Los despachos no pueden hacerse reservables según la normativa del proyecto.</p>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center justify-between gap-3 mb-3">
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Horario de Reserva</p>
                                <p className="text-sm font-semibold text-gray-800">Define las franjas semanales en las que se puede reservar este espacio.</p>
                            </div>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                {form.horarioReserva.filter(day => day.activo).length} días activos
                            </span>
                        </div>

                        <div className="rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="grid grid-cols-[84px_90px_1fr_1fr] bg-slate-100/80 px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <span>Día</span>
                                <span>Activo</span>
                                <span>Inicio</span>
                                <span>Fin</span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {WEEK_DAYS.map(day => {
                                    const schedule = form.horarioReserva.find(item => item.diaSemana === day.value);
                                    return (
                                        <div key={day.value} className="grid grid-cols-[84px_90px_1fr_1fr] items-center gap-3 px-4 py-3 bg-white">
                                            <span className="text-sm font-bold text-gray-800">{day.label}</span>
                                            <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600">
                                                <input
                                                    type="checkbox"
                                                    checked={schedule?.activo ?? false}
                                                    onChange={e => handleScheduleChange(day.value, 'activo', e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                {schedule?.activo ? 'Sí' : 'No'}
                                            </label>
                                            <input
                                                type="time"
                                                value={schedule?.horaInicio ?? '00:00'}
                                                disabled={!schedule?.activo}
                                                onChange={e => handleScheduleChange(day.value, 'horaInicio', e.target.value)}
                                                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
                                            />
                                            <input
                                                type="time"
                                                value={schedule?.horaFin ?? '23:59'}
                                                disabled={!schedule?.activo}
                                                onChange={e => handleScheduleChange(day.value, 'horaFin', e.target.value)}
                                                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        {errors.horarioReserva && <p className="text-rose-500 text-xs mt-2 font-medium">{errors.horarioReserva}</p>}
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
// Modals
// ─────────────────────────────────────────────────────────────────────────────

function ConfirmActionModal({ title, message, onConfirm, onClose, isLoading, isDestructive = true }) {
    if (!title) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDestructive ? 'bg-rose-100' : 'bg-emerald-100'}`}>
                        {isDestructive ? (
                            <svg className="w-7 h-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        ) : (
                            <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 mb-1">{title}</h2>
                        <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{message}</p>
                    </div>
                    <div className="flex gap-3 w-full mt-2">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            id="confirm-action-btn"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                                isDestructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                        >
                            {isLoading && (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                </svg>
                            )}
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reservas Tab
// ─────────────────────────────────────────────────────────────────────────────

function ReservasTab({ reservations, isLoading, onRescind, onForceCancel, onApproveException, onRefresh }) {
    const [filterCategory, setFilterCategory] = useState('');
    const [filterFloor,    setFilterFloor]    = useState('');
    const [search,         setSearch]         = useState('');
    const [onlyAlerts,     setOnlyAlerts]     = useState(false);

    const filtered = reservations.filter(res => {
        const isInvalida = res.esPotencialmenteInvalida || res.estado === 'PotencialmenteInvalida';
        const matchSearch   = search === '' || res.espacioId?.toLowerCase().includes(search.toLowerCase()) || res.solicitante?.toLowerCase().includes(search.toLowerCase()) || res.nombreEspacio?.toLowerCase().includes(search.toLowerCase());
        const matchCategory = filterCategory === '' || res.nombreEspacio?.toLowerCase().includes(filterCategory.toLowerCase());
        const matchFloor    = filterFloor === '' || res.espacioId?.includes(`.${filterFloor}.`) || res.espacioId?.startsWith(`${filterFloor}.`);
        const matchAlert    = !onlyAlerts || isInvalida;
        return matchSearch && matchCategory && matchFloor && matchAlert;
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
                    {/* PBI-13: filtro de alertas */}
                    <label className="flex items-center gap-2 cursor-pointer px-1">
                        <input
                            type="checkbox"
                            checked={onlyAlerts}
                            onChange={e => setOnlyAlerts(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                        />
                        <span className="text-[11px] font-bold text-amber-700">Solo alertas</span>
                    </label>
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
                                ) : filtered.map(res => {
                                    const isInvalida = res.esPotencialmenteInvalida || res.estado === 'PotencialmenteInvalida';
                                    return (
                                    <tr
                                        key={res.id}
                                        className={`transition-colors group ${
                                            isInvalida
                                                ? 'bg-amber-50/70 border-l-4 border-amber-400 hover:bg-amber-100/60'
                                                : 'hover:bg-slate-50/30'
                                        }`}
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{res.espacioId}</span>
                                                <span className="text-[11px] text-gray-500">{res.nombreEspacio}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-semibold text-gray-700">{res.solicitante}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-700">
                                                    {new Date(res.inicio).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} –{' '}
                                                    {new Date(res.fin).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(res.inicio).toLocaleDateString([], {day:'2-digit', month:'short'})}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {isInvalida ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full border border-amber-300 uppercase">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                                    </svg>
                                                    Alerta Aforo
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full border border-green-200 uppercase">Válida</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {isInvalida ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        id={`force-cancel-${res.id}`}
                                                        onClick={() => onForceCancel(res.id)}
                                                        title="Cancelar definitivamente esta reserva"
                                                        className="px-3 py-1.5 bg-rose-50 text-rose-600 text-[11px] font-bold rounded-xl border border-rose-200 hover:bg-rose-600 hover:text-white transition-all hover:scale-105"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        id={`approve-exception-${res.id}`}
                                                        onClick={() => onApproveException(res.id)}
                                                        title="Admitir excepción y mantener la reserva"
                                                        className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-xl border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all hover:scale-105"
                                                    >
                                                        Admitir excepción
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => onRescind(res.id)}
                                                    className="px-4 py-2 bg-rose-50 text-rose-600 text-[11px] font-bold rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all hover:scale-105"
                                                >
                                                    Anular
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total Activas', value: filtered.length, color: 'text-gray-900' },
                        { label: 'Alertas Aforo',  value: filtered.filter(r => r.esPotencialmenteInvalida || r.estado === 'PotencialmenteInvalida').length, color: 'text-amber-500' },
                        { label: 'Sin Incidencias',  value: filtered.filter(r => !r.esPotencialmenteInvalida && r.estado !== 'PotencialmenteInvalida').length, color: 'text-emerald-600' },
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
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">% Uso</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Reserva</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(8)].map((__, j) => (
                                            <td key={j} className="px-6 py-4">
                                                <div className="h-4 bg-slate-100 rounded-full animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm">
                                    No se encontraron espacios con los filtros actuales.
                                </td></tr>
                            ) : filtered.map(s => {
                                const floorLabel = FLOOR_EDIT_OPTIONS.find(o => o.value === String(getFloorVal(s)))?.label
                                    ?? `Planta ${getFloorVal(s)}`;
                                const aforo = s.aforo?.valor ?? s.aforo;
                                const cat   = s.categoriaReserva ?? s.tipoFisico;
                                const reservable = s.esReservable ?? true;
                                const pctEspecifico = s.porcentajeOcupacionEspecifico;
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
                                        {/* PBI-12: columna % Uso */}
                                        <td className="px-6 py-4 text-center">
                                            {pctEspecifico != null ? (
                                                <span className="px-2 py-1 text-[11px] font-black rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200">
                                                    {pctEspecifico}%
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-[11px] font-bold rounded-full border bg-teal-50 text-teal-600 border-teal-200">
                                                    Global
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <CategoryBadge category={cat} />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-full border uppercase ${
                                                reservable
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-rose-50 text-rose-600 border-rose-200'
                                            }`}>
                                                {reservable ? 'Activa' : 'Bloqueada'}
                                            </span>
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

function validateStaff(form, isEditing) {
    const errors = {};
    if (!isEditing && !form.email.trim())
        errors.email = 'El email es obligatorio.';
    else if (!isEditing && (!form.email.includes('@') || !form.email.includes('.')))
        errors.email = 'El email no tiene un formato válido.';

    if (!form.nombre.trim())
        errors.nombre = 'El nombre es obligatorio.';
    if (!form.apellidos.trim())
        errors.apellidos = 'Los apellidos son obligatorios.';
    if (!form.rol)
        errors.rol = 'Selecciona un rol.';
    if ((form.rol === 'InvestigadorContratado' || form.rol === 'DocenteInvestigador' || form.rol === 'TecnicoLaboratorio') && !form.departamento.trim())
        errors.departamento = 'Este rol requiere departamento.';

    return errors;
}

function StaffModal({ persona, onClose, onSaved }) {
    const isEditing = Boolean(persona);
    const [form, setForm] = useState(() => persona ? ({
        email: persona.email ?? '',
        nombre: persona.nombre ?? '',
        apellidos: persona.apellidos ?? '',
        rol: persona.rol ?? 'Estudiante',
        departamento: persona.departamento === 'Sin Departamento' ? '' : (persona.departamento ?? ''),
        esGerente: Boolean(persona.esGerente || persona.roles?.includes('Gerente')),
    }) : emptyStaffForm());
    const [errors, setErrors] = useState({});
    const [serverErr, setServerErr] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field, value) => {
        setForm(current => ({ ...current, [field]: value }));
        setErrors(current => {
            const next = { ...current };
            delete next[field];
            return next;
        });
        setServerErr(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validation = validateStaff(form, isEditing);
        if (Object.keys(validation).length) {
            setErrors(validation);
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                email: form.email.trim().toLowerCase(),
                nombre: form.nombre.trim(),
                apellidos: form.apellidos.trim(),
                rol: form.rol,
                departamento: form.departamento.trim(),
                esGerente: form.esGerente,
            };

            if (isEditing)
                await api.put(`admin/staff/${encodeURIComponent(persona.email)}`, payload);
            else
                await api.post('admin/staff', payload);

            onSaved(isEditing ? 'Persona actualizada correctamente.' : 'Persona creada correctamente.');
        } catch (err) {
            const data = err.response?.data;
            let errMsg = isEditing ? 'Error al actualizar la persona.' : 'Error al crear la persona.';
            if (typeof data === 'string') errMsg = data;
            else if (data?.detail) errMsg = data.detail;
            else if (data?.title) errMsg = data.title;
            else if (data?.message) errMsg = data.message;
            setServerErr(errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-7 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                                {isEditing ? 'Editar personal' : 'Alta de personal'}
                            </p>
                            <h2 className="text-white text-xl font-black">{isEditing ? persona.email : 'Nueva persona'}</h2>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            disabled={isEditing}
                            onChange={e => handleChange('email', e.target.value)}
                            className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-all ${
                                errors.email ? 'border-rose-400 bg-rose-50' : 'border-gray-200'
                            } ${isEditing ? 'opacity-60 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500'}`}
                        />
                        {errors.email && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Nombre</label>
                            <input
                                type="text"
                                value={form.nombre}
                                onChange={e => handleChange('nombre', e.target.value)}
                                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                                    errors.nombre ? 'border-rose-400 bg-rose-50' : 'border-gray-200'
                                }`}
                            />
                            {errors.nombre && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.nombre}</p>}
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Apellidos</label>
                            <input
                                type="text"
                                value={form.apellidos}
                                onChange={e => handleChange('apellidos', e.target.value)}
                                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                                    errors.apellidos ? 'border-rose-400 bg-rose-50' : 'border-gray-200'
                                }`}
                            />
                            {errors.apellidos && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.apellidos}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Rol</label>
                            <select
                                value={form.rol}
                                onChange={e => handleChange('rol', e.target.value)}
                                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                                    errors.rol ? 'border-rose-400 bg-rose-50' : 'border-gray-200'
                                }`}
                            >
                                {ROLE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                            {errors.rol && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.rol}</p>}
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Gerencia</label>
                            <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={form.esGerente}
                                    onChange={e => handleChange('esGerente', e.target.checked)}
                                />
                                Permisos de gerente
                            </label>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Departamento</label>
                            <select
                                value={form.departamento}
                                onChange={e => handleChange('departamento', e.target.value)}
                                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 appearance-none cursor-pointer ${
                                    errors.departamento ? 'border-rose-400 bg-rose-50' : 'border-gray-200'
                                }`}
                            >
                                {DEPARTMENT_OPTIONS.map(d => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                            </select>
                            {errors.departamento && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.departamento}</p>}
                        </div>
                    </div>

                    {serverErr && (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">
                            {serverErr}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-3 rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
                        >
                            {isLoading ? 'Guardando...' : (isEditing ? 'Guardar cambios' : 'Crear persona')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function StaffTab({ onToast }) {
    const [people, setPeople] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [editTarget, setEditTarget] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    const fetchPeople = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get('admin/staff');
            setPeople(res.data);
        } catch {
            onToast('error', 'Error al cargar el personal.');
        } finally {
            setIsLoading(false);
        }
    }, [onToast]);

    useEffect(() => { fetchPeople(); }, [fetchPeople]);

    const filtered = people.filter(person => {
        const q = search.toLowerCase();
        const fullName = `${person.nombre ?? ''} ${person.apellidos ?? ''}`.toLowerCase();
        const matchSearch = q === '' || person.email?.toLowerCase().includes(q) || fullName.includes(q);
        const matchRole = filterRole === '' || person.rol === filterRole;
        return matchSearch && matchRole;
    });

    const handleSaved = (message) => {
        setEditTarget(null);
        setIsCreating(false);
        onToast('success', message);
        fetchPeople();
    };

    return (
        <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex-1 min-w-[180px]">
                    <input
                        type="text"
                        placeholder="Buscar por email o nombre…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                    />
                </div>
                <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm">
                    <option value="">Todos los roles</option>
                    {ROLE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <button
                    onClick={() => setIsCreating(true)}
                    className="px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                    Nueva persona
                </button>
                <button onClick={fetchPeople} title="Refrescar"
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
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rol</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Departamento</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(5)].map((__, j) => (
                                            <td key={j} className="px-6 py-4">
                                                <div className="h-4 bg-slate-100 rounded-full animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                                    No hay personas que coincidan con los filtros actuales.
                                </td></tr>
                            ) : filtered.map(person => (
                                <tr key={person.email} className="hover:bg-slate-50/40 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">{person.nombre} {person.apellidos}</span>
                                            <span className="text-[11px] text-gray-500">Cuenta gestionable por gerencia</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-700">{person.email}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StaffRoleBadge role={person.rol} esGerente={person.esGerente} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{person.departamento || 'Sin Departamento'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setEditTarget(person)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all hover:scale-105"
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isCreating && (
                <StaffModal
                    onClose={() => setIsCreating(false)}
                    onSaved={handleSaved}
                />
            )}

            {editTarget && (
                <StaffModal
                    persona={editTarget}
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
// ConfiguracionTab — porcentaje de aforo global del edificio (PBI-6)
// ─────────────────────────────────────────────────────────────────────────────

function ConfiguracionTab({ onToast }) {
    const [porcentaje, setPorcentaje] = useState('');
    const [current,    setCurrent]    = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [saving,     setSaving]     = useState(false);
    const [error,      setError]      = useState('');

    useEffect(() => {
        api.get('Admin/config')
            .then(r => {
                setCurrent(r.data.porcentajeOcupacion ?? r.data.PorcentajeOcupacion);
                setPorcentaje(String(r.data.porcentajeOcupacion ?? r.data.PorcentajeOcupacion ?? 100));
            })
            .catch(() => { setCurrent(100); setPorcentaje('100'); })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        const val = parseFloat(porcentaje);
        if (isNaN(val) || val < 0 || val > 100) {
            setError('El porcentaje debe ser un número entre 0 y 100.');
            return;
        }
        setError('');
        setSaving(true);
        try {
            await api.put('Admin/config', { porcentajeOcupacion: val });
            setCurrent(val);
            onToast?.('Porcentaje global actualizado correctamente.', 'success');
        } catch (e) {
            const msg = e.response?.data?.detail || e.response?.data || 'Error al guardar.';
            setError(typeof msg === 'string' ? msg : 'Error al guardar.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-6 space-y-6">
            {/* Cabecera */}
            <div>
                <h2 className="text-xl font-black text-gray-900">Configuración del Edificio</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Ajusta el porcentaje máximo de ocupación permitido para todos los espacios del edificio Ada Byron.
                    Los espacios con porcentaje específico propio no se ven afectados.
                </p>
            </div>

            {/* Tarjeta */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                {/* Valor actual */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <span className="text-sm font-bold text-gray-600">Porcentaje actual</span>
                    {loading ? (
                        <span className="text-sm text-gray-400">Cargando…</span>
                    ) : (
                        <span className={`text-2xl font-black ${current < 50 ? 'text-rose-600' : current < 80 ? 'text-amber-500' : 'text-emerald-600'}`}>
                            {current}%
                        </span>
                    )}
                </div>

                {/* Input nuevo valor */}
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                        Nuevo porcentaje de ocupación
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={porcentaje}
                            onChange={e => { setPorcentaje(e.target.value); setError(''); }}
                            disabled={loading}
                            className={`flex-1 bg-slate-50 border rounded-xl px-4 py-3 text-sm font-bold text-gray-800 outline-none transition-all
                                focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                                ${error ? 'border-rose-400 bg-rose-50' : 'border-gray-200'}`}
                            placeholder="0 – 100"
                        />
                        <span className="text-lg font-black text-gray-400">%</span>
                    </div>
                    {error && <p className="text-rose-500 text-xs mt-2 font-medium">{error}</p>}
                </div>

                {/* Barra visual */}
                <div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-300 ${
                                (parseFloat(porcentaje) || 0) < 50 ? 'bg-rose-500'
                                : (parseFloat(porcentaje) || 0) < 80 ? 'bg-amber-400'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(Math.max(parseFloat(porcentaje) || 0, 0), 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium">
                        <span>0% (cerrado)</span>
                        <span>50%</span>
                        <span>100% (completo)</span>
                    </div>
                </div>

                {/* Botón */}
                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all
                        disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                    {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
            </div>

            {/* Info */}
            <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-700">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p>
                    Este porcentaje afecta al aforo efectivo de todos los espacios que no tengan un porcentaje propio configurado.
                    Por ejemplo, con un 50% un aula de 40 personas solo admitirá 20 asistentes por reserva.
                </p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const navigate = useNavigate();
    const user     = getUser();

    const [activeTab,    setActiveTab]    = useState('reservas');
    const [reservations, setReservations] = useState([]);
    const [isLoading,    setIsLoading]    = useState(true);
    const [toast,        setToast]        = useState(null);
    const [actionModal,  setActionModal]  = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

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

    const handleRescind = (id) => {
        setActionModal({
            type: 'rescind',
            id,
            title: '¿Anular reserva?',
            message: `Vas a anular definitivamente la reserva ${id}. El usuario será notificado.`,
            isDestructive: true
        });
    };

    const handleForceCancel = (id) => {
        setActionModal({
            type: 'forceCancel',
            id,
            title: 'Cancelar por aforo',
            message: `El aforo de este espacio ya no es suficiente para esta reserva.\n¿Cancelar definitivamente? El usuario será notificado.`,
            isDestructive: true
        });
    };

    const handleApproveException = (id) => {
        setActionModal({
            type: 'approveException',
            id,
            title: 'Admitir excepción',
            message: `¿Admitir excepción? La reserva volverá a estado Aceptada aunque supere el aforo actual.`,
            isDestructive: false
        });
    };

    const handleConfirmAction = async () => {
        if (!actionModal) return;
        setIsActionLoading(true);
        const { type, id } = actionModal;

        try {
            if (type === 'rescind') {
                await api.delete(`Admin/reservations/${id}`);
                showToast('success', 'Reserva anulada. Usuario notificado vía SignalR.');
            } else if (type === 'forceCancel') {
                await api.post(`Admin/reservations/${id}/force-cancel`);
                showToast('success', 'Reserva cancelada administrativamente.');
            } else if (type === 'approveException') {
                await api.post(`Admin/reservations/${id}/approve-exception`);
                showToast('success', 'Excepción admitida correctamente.');
            }
            await fetchReservations();
        } catch (err) {
            const data = err.response?.data;
            let errMsg = 'Error al procesar la acción.';
            if (typeof data === 'string') errMsg = data;
            else if (data?.detail) errMsg = data.detail;
            else if (data?.title) errMsg = data.title;
            else if (data?.message) errMsg = data.message;
            showToast('error', errMsg);
        } finally {
            setIsActionLoading(false);
            setActionModal(null);
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
                            onForceCancel={handleForceCancel}
                            onApproveException={handleApproveException}
                            onRefresh={fetchReservations}
                        />
                    )}
                    {activeTab === 'espacios' && (
                        <EspaciosTab onToast={showToast} />
                    )}
                    {activeTab === 'staff' && (
                        <StaffTab onToast={showToast} />
                    )}
                    {activeTab === 'configuracion' && (
                        <ConfiguracionTab onToast={showToast} />
                    )}
                </div>
            </main>

            {actionModal && (
                <ConfirmActionModal
                    title={actionModal.title}
                    message={actionModal.message}
                    isDestructive={actionModal.isDestructive}
                    isLoading={isActionLoading}
                    onConfirm={handleConfirmAction}
                    onClose={() => setActionModal(null)}
                />
            )}
        </div>
    );
}
