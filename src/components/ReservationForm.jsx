import { useMemo, useState } from 'react';

export default function ReservationForm({ selectedSpace }) {
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);
    const [form, setForm] = useState({
        uso: '',
        asistentes: 1,
        fecha: today,
        horaInicio: '',
        horaFin: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [previewPayload, setPreviewPayload] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'asistentes' ? Number(value) : value,
        }));
    };

    const validateForm = () => {
        if (!selectedSpace) {
            return 'Debes seleccionar un espacio en el mapa.';
        }

        if (!form.uso.trim()) {
            return 'El uso o motivo de la reserva es obligatorio.';
        }

        if (!form.fecha || !form.horaInicio || !form.horaFin) {
            return 'Debes indicar fecha, hora de inicio y hora de fin.';
        }

        if (form.asistentes <= 0) {
            return 'El número de asistentes debe ser mayor que 0.';
        }

        const inicio = new Date(`${form.fecha}T${form.horaInicio}`);
        const fin = new Date(`${form.fecha}T${form.horaFin}`);

        if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
            return 'Las horas introducidas no son válidas.';
        }

        if (fin <= inicio) {
            return 'La hora de fin debe ser posterior a la de inicio.';
        }

        return '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setPreviewPayload(null);

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        const payload = {
            espacioId: selectedSpace.id_espacio ?? selectedSpace.idEspacio ?? selectedSpace.id,
            nombreEspacio: selectedSpace.nombre ?? '',
            usoReserva: form.uso,
            asistentes: form.asistentes,
            fecha: form.fecha,
            horaInicio: form.horaInicio,
            horaFin: form.horaFin,
        };

        console.log('Payload de reserva simulado:', payload);
        setPreviewPayload(payload);
        setSuccess('Formulario válido. Reserva preparada correctamente (modo local, sin backend).');
    };

    return (
        <div
            style={{
                padding: '1rem',
                background: '#ffffff',
                border: '1px solid #ddd',
                borderRadius: '12px',
                marginTop: '1rem',
                maxWidth: '460px',
                width: '100%',
            }}
        >
            <h2 style={{ marginTop: 0 }}>Formulario de reserva</h2>

            {selectedSpace ? (
                <div
                    style={{
                        marginBottom: '1rem',
                        padding: '0.75rem',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                    }}
                >
                    <div><strong>Espacio:</strong> {selectedSpace.nombre || 'Sin nombre'}</div>
                    <div><strong>ID:</strong> {selectedSpace.id_espacio || '-'}</div>
                    <div><strong>Uso actual:</strong> {selectedSpace.uso || '-'}</div>
                    <div><strong>Planta:</strong> {selectedSpace.altura || '-'}</div>
                </div>
            ) : (
                <p style={{ color: '#64748b' }}>
                    Selecciona primero una sala en el mapa para preparar una reserva.
                </p>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                        Uso / motivo
                    </label>
                    <input
                        type="text"
                        name="uso"
                        value={form.uso}
                        onChange={handleChange}
                        placeholder="Ej. Tutoría, práctica, reunión..."
                        style={{
                            width: '100%',
                            padding: '0.65rem',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                        }}
                    />
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                        Asistentes
                    </label>
                    <input
                        type="number"
                        min="1"
                        name="asistentes"
                        value={form.asistentes}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '0.65rem',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                        }}
                    />
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                        Fecha
                    </label>
                    <input
                        type="date"
                        name="fecha"
                        value={form.fecha}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '0.65rem',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                            Hora inicio
                        </label>
                        <input
                            type="time"
                            name="horaInicio"
                            value={form.horaInicio}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.65rem',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                            }}
                        />
                    </div>

                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                            Hora fin
                        </label>
                        <input
                            type="time"
                            name="horaFin"
                            value={form.horaFin}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.65rem',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                            }}
                        />
                    </div>
                </div>

                {error && (
                    <div
                        style={{
                            marginBottom: '0.75rem',
                            padding: '0.75rem',
                            background: '#fef2f2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                        }}
                    >
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        style={{
                            marginBottom: '0.75rem',
                            padding: '0.75rem',
                            background: '#f0fdf4',
                            color: '#166534',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                        }}
                    >
                        {success}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!selectedSpace}
                    style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: !selectedSpace ? '#94a3b8' : '#2563eb',
                        color: 'white',
                        cursor: !selectedSpace ? 'not-allowed' : 'pointer',
                        fontWeight: 700,
                        width: '100%',
                    }}
                >
                    Preparar reserva
                </button>
            </form>

            {previewPayload && (
                <div style={{ marginTop: '1rem' }}>
                    <strong>Payload simulado:</strong>
                    <pre
                        style={{
                            marginTop: '0.5rem',
                            padding: '0.75rem',
                            background: '#0f172a',
                            color: '#e2e8f0',
                            borderRadius: '8px',
                            overflowX: 'auto',
                            fontSize: '12px',
                        }}
                    >
                        {JSON.stringify(previewPayload, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}