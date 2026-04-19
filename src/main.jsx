import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import LoginPage from './pages/LoginPage';
import MapPage   from './pages/MapPage';
import SearchPage from './pages/SearchPage';
import AdminDashboard from './pages/AdminDashboard';
import MisReservas from './pages/MyReservationsPage';
import { getUser, isAuthenticated } from './services/authService';
import { NotificationProvider } from './services/NotificationProvider';

function PrivateRoute({ children }) {
    return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

// Evita que usuarios ya autenticados vean la pantalla de login
function PublicRoute({ children }) {
    return isAuthenticated() ? <Navigate to="/mapa" replace /> : children;
}

function RoleRoute({ children, role }) {
    const user = getUser();
    if (!isAuthenticated()) return <Navigate to="/login" replace />;
    return user?.rol === role ? children : <Navigate to="/mapa" replace />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <NotificationProvider>
                <Routes>
                    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                    <Route
                        path="/mapa"
                        element={
                            <PrivateRoute>
                                <MapPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/buscar"
                        element={
                            <PrivateRoute>
                                <SearchPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <RoleRoute role="Gerente">
                                <AdminDashboard />
                            </RoleRoute>
                        }
                    />
                    <Route
                        path="/mis-reservas"
                        element={
                            <PrivateRoute>
                                <MisReservas />
                            </PrivateRoute>
                        }
                    />
                    {/* Redirige "/" según el estado de sesión */}
                    <Route path="*" element={<Navigate to={isAuthenticated() ? '/mapa' : '/login'} replace />} />
                </Routes>
            </NotificationProvider>
        </BrowserRouter>
    </React.StrictMode>
);
