import { useEffect, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { getToken } from '../services/authService';

/**
 * Hook personalizado para gestionar la conexión SignalR con /hubs/notifications (HU-18).
 * Maneja la reconexión automática y el filtrado por token JWT.
 */
export function useNotifications() {
    const [connection, setConnection] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const token = getToken();
        if (!token) return;

        // Configuración con reconexión automática (Edge Case Handling)
        // Se usa ruta relativa para pasar por el proxy configurado en vite.config.js y evitar problemas CORS/WebSocket
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl('/hubs/reservations', {
                accessTokenFactory: () => token,
                skipNegotiation: false,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (!connection) return;

        const startConnection = async () => {
            try {
                await connection.start();
                console.log('SignalR: Conectado al Hub de Notificaciones');
                
                // Listener para el evento de anulación administrativa
                connection.on('ReservaAnulada', (data) => {
                    const newNotification = {
                        id: Date.now(),
                        type: 'danger',
                        title: '¡Reserva Anulada!',
                        message: `Tu reserva en ${data.espacio} ha sido cancelada por un administrador: "${data.mensaje}"`,
                        timestamp: new Date()
                    };
                    setNotifications(prev => [newNotification, ...prev]);
                });

            } catch (err) {
                console.error('SignalR: Error de conexión', err);
            }
        };

        if (connection.state === signalR.HubConnectionState.Disconnected) {
            startConnection();
        }

        return () => {
            connection.off('ReservaAnulada');
            connection.stop();
        };
    }, [connection]);

    const clearNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return { notifications, clearNotification };
}
