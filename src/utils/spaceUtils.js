/**
 * Utilidades compartidas sobre horarios y disponibilidad de espacios.
 * Usadas en ReservationForm, SearchPage y cualquier componente que
 * necesite mostrar el estado actual de reservabilidad de un espacio.
 */

export const WEEK_DAYS = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 0, label: 'Domingo' },
];

/** Normaliza el array de horario que devuelve el backend, asegurando los 7 días. */
export function normalizeSchedule(schedule) {
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

/** Devuelve el horario normalizado de un espacio. */
export function getSpaceSchedule(space) {
    return normalizeSchedule(space?.horarioReserva);
}

/** Devuelve un array de strings legibles con los días y franjas activas. */
export function getScheduleSummary(space) {
    if (!space) return [];
    if (space.esReservable === false) return ['Reservas desactivadas'];

    return getSpaceSchedule(space)
        .filter(day => day.activo)
        .map(day => {
            const label = WEEK_DAYS.find(item => item.value === day.diaSemana)?.label ?? 'Día';
            return `${label}: ${day.horaInicio} - ${day.horaFin}`;
        });
}

/**
 * Calcula la disponibilidad del espacio en el instante actual.
 *
 * @returns {'blocked'}       esReservable === false (admin lo bloqueó)
 * @returns {'out_of_hours'}  reservable pero fuera del horario de hoy
 * @returns {'available'}     dentro del horario permitido ahora mismo
 */
export function getSpaceAvailabilityNow(space) {
    if (!space) return 'blocked';
    if (space.esReservable === false) return 'blocked';

    const now = new Date();
    const jsDay = now.getDay(); // 0 = Domingo, 1 = Lunes …
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hh}:${mm}`;

    const schedule = getSpaceSchedule(space);
    const dayConfig = schedule.find(d => d.diaSemana === jsDay);

    if (!dayConfig?.activo) return 'out_of_hours';
    if (currentTime < dayConfig.horaInicio || currentTime > dayConfig.horaFin) return 'out_of_hours';

    return 'available';
}

/**
 * Devuelve las clases CSS y el texto del badge según la disponibilidad actual.
 *
 * @param {'blocked'|'out_of_hours'|'available'} availability
 */
export function availabilityBadgeProps(availability) {
    switch (availability) {
        case 'blocked':
            return {
                label: 'Bloqueado',
                className: 'bg-rose-50 border-rose-200 text-rose-700',
            };
        case 'out_of_hours':
            return {
                label: 'Fuera de horario',
                className: 'bg-amber-50 border-amber-200 text-amber-700',
            };
        case 'available':
        default:
            return {
                label: 'Disponible',
                className: 'bg-emerald-50 border-emerald-200 text-emerald-700',
            };
    }
}
