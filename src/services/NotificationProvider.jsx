import React, { createContext, useContext } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationBanner from '../components/NotificationBanner';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { notifications, clearNotification } = useNotifications();

    return (
        <NotificationContext.Provider value={{ notifications, clearNotification }}>
            {children}
            {/* Renderizar múltiples notificaciones si es necesario (carousel o stack) */}
            <div className="fixed bottom-0 right-0 z-[3000] p-6 space-y-4">
                {notifications.map(n => (
                    <NotificationBanner key={n.id} notification={n} onClose={clearNotification} />
                ))}
            </div>
        </NotificationContext.Provider>
    );
}

export const useGlobalNotifications = () => useContext(NotificationContext);
