import { useEffect, useState, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { getToken } from '../services/authService';

/**
 * Hook para gestionar la conexión SignalR con /hubs/notifications (HU-18).
 *
 * Detalles de implementación:
 *
 * 1. skipNegotiation: true + WebSockets
 *    El proxy Vite tiene ws:true en /hubs, así que el WebSocket pasa correctamente.
 *    El token se adjunta como ?access_token=TOKEN en la URL del WebSocket;
 *    el handler OnMessageReceived del backend lo extrae para el [Authorize] del hub.
 *
 * 2. accessTokenFactory lee getToken() en cada llamada (no captura en closure).
 *
 * 3. Guard de identidad en el catch (fix React StrictMode):
 *    En desarrollo StrictMode monta → desmonta → monta. El cleanup del primer mount
 *    llama a conn1.stop() mientras conn1.start() sigue en vuelo → AbortError.
 *    Para cuando ese catch se ejecuta, Run 2 ya creó conn2 y lo asignó al ref.
 *    Sin el guard, el catch de Run 1 nullea el ref y mata la referencia a conn2.
 *    Con "if (connectionRef.current === conn)" solo nulleamos si el ref sigue
 *    apuntando a ESTA conexión, no a una más nueva.
 *
 * 4. Escucha 'ada-auth-changed' para reconectarse cuando el usuario hace login
 *    sin recargar la página (authService.saveSession dispara ese evento).
 */
export function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const connectionRef = useRef(null);

    const startConnection = useCallback(async () => {
        const token = getToken();
        if (!token) return;

        // No crear si ya hay una conexión activa o conectándose
        if (connectionRef.current) {
            const { state } = connectionRef.current;
            if (state !== signalR.HubConnectionState.Disconnected) return;
        }

        const conn = new signalR.HubConnectionBuilder()
            .withUrl('/hubs/notifications', {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
                accessTokenFactory: () => getToken() ?? '',
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
            .build();

        // Registrar listeners antes de start() para no perder eventos de la primera conexión
        conn.on('ReservaAnulada', (data) => {
            setNotifications(prev => [{
                id: Date.now(),
                type: 'danger',
                title: '¡Reserva Anulada!',
                message: `Tu reserva en ${data.espacio ?? data.Espacio} ha sido cancelada por un administrador.`,
                timestamp: new Date(),
            }, ...prev]);
        });

        conn.on('ReceiveCancellation', (message) => {
            import('react-hot-toast').then(({ default: toast }) => {
                toast.error(`Cancelación automática:\n${message}`, { duration: 8000 });
            });
        });

        // Asignar al ref ANTES del await para que el guard de identidad funcione
        connectionRef.current = conn;

        try {
            await conn.start();
            console.log('[SignalR] Conectado a NotificationHub');
        } catch (err) {
            // En React StrictMode (dev) el cleanup del primer mount llama a stop()
            // mientras start() sigue en vuelo → AbortError esperado.
            // CRÍTICO: solo nullear si el ref sigue apuntando a ESTA conexión.
            // Si Run 2 ya creó conn2, connectionRef.current !== conn y no lo tocamos.
            if (connectionRef.current === conn) {
                connectionRef.current = null;
            }
            if (!(err instanceof Error && err.message.includes('stop() was called'))) {
                console.error('[SignalR] Error al conectar:', err);
            }
        }
    }, []);

    useEffect(() => {
        startConnection();
        window.addEventListener('ada-auth-changed', startConnection);

        return () => {
            window.removeEventListener('ada-auth-changed', startConnection);
            const conn = connectionRef.current;
            if (conn) {
                connectionRef.current = null;
                conn.stop();
            }
        };
    }, [startConnection]);

    const clearNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return { notifications, clearNotification };
}
