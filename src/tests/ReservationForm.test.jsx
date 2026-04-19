import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReservationForm from '../components/ReservationForm';
import { createReservation } from '../services/api';
import { getUser } from '../services/authService';

// Mockeamos la capa de Red (API) y la capa de Autenticación LocalStorage
vi.mock('../services/api', () => ({
    createReservation: vi.fn()
}));

vi.mock('../services/authService', () => ({
    getUser: vi.fn()
}));

describe('ReservationForm Component Tests', () => {
    const mockSpace = {
        id: 'A-01',
        name: 'Aula de Informática',
        uso: 'Docencia',
        floor: 1
    };

    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Simulamos que el usuario tiene una sesión iniciada con éxito
        getUser.mockReturnValue({ email: 'miguel@unizar.es' });
    });

    it('1. Renderiza correctamente los datos inmutables del aula seleccionada en el estado', () => {
        render(<ReservationForm selectedSpace={mockSpace} onClose={mockOnClose} />);
        
        expect(screen.getByText('Aula de Informática')).toBeInTheDocument();
        expect(screen.getByText('ID: A-01')).toBeInTheDocument();
        expect(screen.getByText('Docencia')).toBeInTheDocument();
        expect(screen.getByText('P.1')).toBeInTheDocument();
    });

    it('2. Bloquea el envío en el Frontend lanzando un error reactivo si se pulsa confirmar sin rellenar la hora', async () => {
        render(<ReservationForm selectedSpace={mockSpace} onClose={mockOnClose} />);
        
        const submitBtn = screen.getByRole('button', { name: /Confirmar Reserva/i });
        fireEvent.click(submitBtn);

        // Sin rellenar horaInicio y horaFin debe salir el error de validación local del DOM sin llamar al Backend
        expect(await screen.findByText('Indica fecha, hora inicio y fin.')).toBeInTheDocument();
        expect(createReservation).not.toHaveBeenCalled();
    });

    it('3. Muestra el Feedback dinámico negativo si la API del Backend devuelve un fallo de Regla de Negocio (Ej. Aforo Excedido)', async () => {
        // Configuramos el Mock de Axios para que finja una respuesta de error real interceptada desde .NET DTO
        createReservation.mockRejectedValue({
            response: { data: { detail: 'Aforo excedido para este Espacio' } }
        });

        const { container } = render(<ReservationForm selectedSpace={mockSpace} onClose={mockOnClose} />);
        
        // Rellenamos el DOM HTML
        fireEvent.change(container.querySelector('input[name="horaInicio"]'), { target: { value: '10:00' } });
        fireEvent.change(container.querySelector('input[name="horaFin"]'), { target: { value: '12:00' } });
        
        fireEvent.click(screen.getByRole('button', { name: /Confirmar Reserva/i }));

        // Esperamos asíncronamente a que el Render State muestre el Banner rojo del Backend
        expect(await screen.findByText('Aforo excedido para este Espacio')).toBeInTheDocument();
        expect(createReservation).toHaveBeenCalledTimes(1);
    });

    it('4. Informa de éxito verde si el Componente completa exitosamente todo el Fetch de Backend', async () => {
        createReservation.mockResolvedValue({}); // La API responde 200 OK

        const { container } = render(<ReservationForm selectedSpace={mockSpace} onClose={mockOnClose} />);
        
        fireEvent.change(container.querySelector('input[name="horaInicio"]'), { target: { value: '10:00' } });
        fireEvent.change(container.querySelector('input[name="horaFin"]'), { target: { value: '12:00' } });
        
        fireEvent.click(screen.getByRole('button', { name: /Confirmar Reserva/i }));

        expect(await screen.findByText('Reserva confirmada.')).toBeInTheDocument();
        expect(createReservation).toHaveBeenCalledTimes(1);
    });

    it('5. Bloquea en frontend una reserva cuando el espacio está marcado como no reservable', async () => {
        render(<ReservationForm selectedSpace={{ ...mockSpace, esReservable: false }} onClose={mockOnClose} />);

        expect(screen.getByText('Reservas desactivadas')).toBeInTheDocument();

        const submitBtn = screen.getByRole('button', { name: /Confirmar Reserva/i });
        expect(submitBtn).toBeDisabled();
        expect(createReservation).not.toHaveBeenCalled();
    });

    it('6. Bloquea en frontend una reserva fuera del horario permitido', async () => {
        const spaceWithSchedule = {
            ...mockSpace,
            esReservable: true,
            horarioReserva: [
                { diaSemana: 1, activo: true, horaInicio: '09:00', horaFin: '13:00' },
                { diaSemana: 2, activo: true, horaInicio: '09:00', horaFin: '13:00' },
                { diaSemana: 3, activo: true, horaInicio: '09:00', horaFin: '13:00' },
                { diaSemana: 4, activo: true, horaInicio: '09:00', horaFin: '13:00' },
                { diaSemana: 5, activo: true, horaInicio: '09:00', horaFin: '13:00' },
                { diaSemana: 6, activo: false, horaInicio: '09:00', horaFin: '13:00' },
                { diaSemana: 0, activo: false, horaInicio: '09:00', horaFin: '13:00' },
            ],
        };

        const { container } = render(<ReservationForm selectedSpace={spaceWithSchedule} onClose={mockOnClose} />);

        fireEvent.change(container.querySelector('input[name="fecha"]'), { target: { value: '2026-04-20' } });
        fireEvent.change(container.querySelector('input[name="horaInicio"]'), { target: { value: '08:00' } });
        fireEvent.change(container.querySelector('input[name="horaFin"]'), { target: { value: '10:00' } });

        expect(await screen.findByText('Solo se puede reservar entre 09:00 y 13:00 para esa fecha.')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Confirmar Reserva/i }));

        expect(createReservation).not.toHaveBeenCalled();
    });
});
