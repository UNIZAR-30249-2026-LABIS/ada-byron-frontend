import React, { useEffect } from 'react';

/**
 * Componente Toast/Alert para notificaciones en tiempo real bajo demanda (HU-18).
 * Diseño premium: sombreado suave, bordes redondeados, tipografía jerarquizada.
 */
export default function NotificationBanner({ notification, onClose }) {
    if (!notification) return null;

    useEffect(() => {
        const timer = setTimeout(() => onClose(notification.id), 8000); // 8s auto-close
        return () => clearTimeout(timer);
    }, [notification, onClose]);

    const isDanger = notification.type === 'danger';

    return (
        <div className={`fixed bottom-8 right-8 z-[2000] w-[360px] p-1 rounded-[24px] shadow-2xl transition-all animate-in slide-in-from-bottom-5 duration-300 ${isDanger ? 'bg-rose-500/10' : 'bg-blue-500/10'}`}>
            <div className="bg-white rounded-[22px] p-5 border border-gray-100 flex gap-4 overflow-hidden relative">
                {/* Accent line */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${isDanger ? 'bg-rose-500' : 'bg-blue-500'}`} />
                
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isDanger ? 'bg-rose-100' : 'bg-blue-100'}`}>
                    <svg className={`w-5 h-5 ${isDanger ? 'text-rose-600' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-sm font-black text-gray-900 mb-1 tracking-tight">{notification.title}</h4>
                    <p className="text-[11px] text-gray-600 font-medium leading-relaxed mb-3 pr-2">
                        {notification.message}
                    </p>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md">
                        {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                <button 
                    onClick={() => onClose(notification.id)}
                    className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
