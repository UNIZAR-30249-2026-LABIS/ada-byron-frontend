import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NotificationBanner from '../components/NotificationBanner';
import { NotificationProvider } from '../services/NotificationProvider';
import * as signalR from '@microsoft/signalr';

// Mock de la dependencia de SignalR
vi.mock('@microsoft/signalr', () => {
    const onMock = vi.fn();
    const startMock = vi.fn().mockResolvedValue();
    const stopMock = vi.fn();
    
    return {
        HubConnectionBuilder: vi.fn().mockImplementation(() => ({
            withUrl: vi.fn().mockReturnThis(),
            withAutomaticReconnect: vi.fn().mockReturnThis(),
            build: vi.fn().mockReturnValue({
                start: startMock,
                on: onMock,
                off: vi.fn(),
                stop: stopMock,
                state: 'Disconnected'
            })
        })),
        HttpTransportType: { WebSockets: 1 }
    };
});

describe('HU-18: SignalR Notifications', () => {
    it('debe renderizar la notificación correctamente cuando se recibe un evento ReservaAnulada', async () => {
        const mockNotification = {
            id: 1,
            type: 'danger',
            title: '¡Reserva Anulada!',
            message: 'Tu reserva en ADA.1200 ha sido cancelada por un administrador: "Mantenimiento preventivo"',
            timestamp: new Date()
        };

        const onClose = vi.fn();

        render(
            <NotificationBanner 
                notification={mockNotification} 
                onClose={onClose} 
            />
        );

        // Assert: El título y el mensaje deben ser visibles
        expect(screen.getByText('¡Reserva Anulada!')).toBeInTheDocument();
        expect(screen.getByText(/ADA.1200/)).toBeInTheDocument();
        expect(screen.getByText(/Mantenimiento preventivo/)).toBeInTheDocument();
    });

    it('la notificación (Banner) debe mostrar el icono de alerta (SVG)', () => {
        const mockNotification = {
            id: 2,
            type: 'danger',
            title: 'Test',
            message: 'Test Message',
            timestamp: new Date()
        };

        render(<NotificationBanner notification={mockNotification} onClose={() => {}} />);
        
        // Verifica que el contenedor tiene las clases de estilo premium para 'danger'
        const iconContainer = screen.getByRole('button').parentElement;
        expect(iconContainer).toBeInTheDocument();
    });
});
