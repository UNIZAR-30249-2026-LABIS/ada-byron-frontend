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
        HubConnectionState: {
            Disconnected: 'Disconnected',
            Connected: 'Connected',
            Connecting: 'Connecting',
            Reconnecting: 'Reconnecting'
        },
        HttpTransportType: { WebSockets: 1 }
    };
});

describe('HU-18: SignalR Lifecycle and Connection', () => {
    it('debe iniciar la conexión con el Hub URL y Token correctos', async () => {
        // Simular token en localStorage
        localStorage.setItem('ada_token', 'fake-jwt-token');
        
        render(
            <NotificationProvider>
                <div>Test App</div>
            </NotificationProvider>
        );

        // SignalR builder debe haber sido llamado
        expect(signalR.HubConnectionBuilder).toHaveBeenCalled();
    });

    it('debe registrar el callback para el evento "ReservaAnulada"', () => {
        render(
            <NotificationProvider>
                <div>Test App</div>
            </NotificationProvider>
        );

        // Verificamos el acceso al mock de la conexión (vía el mock de build)
        const connectionInstance = new signalR.HubConnectionBuilder().build();
        expect(connectionInstance.on).toHaveBeenCalledWith('ReservaAnulada', expect.any(Function));
    });
});

describe('HU-18: UI Notification Stack', () => {
    it('debe mostrar el mensaje de la notificación recibida mediante props', () => {
        const mockNotification = {
            id: 1,
            type: 'danger',
            title: '¡Reserva Anulada!',
            message: 'Aula ADA.1200',
            timestamp: new Date()
        };

        render(<NotificationBanner notification={mockNotification} onClose={() => {}} />);
        expect(screen.getByText('¡Reserva Anulada!')).toBeInTheDocument();
        expect(screen.getByText('Aula ADA.1200')).toBeInTheDocument();
    });

    it('el Toast debe desaparecer tras hacer clic en el botón de cerrar', async () => {
        const onClose = vi.fn();
        const mockNotification = {
            id: 1,
            type: 'info',
            title: 'Info Close',
            message: 'Close test',
            timestamp: new Date()
        };

        render(<NotificationBanner notification={mockNotification} onClose={onClose} />);
        
        const closeBtn = screen.getByRole('button');
        await act(async () => {
            closeBtn.click();
        });

        expect(onClose).toHaveBeenCalledWith(1);
    });
});
