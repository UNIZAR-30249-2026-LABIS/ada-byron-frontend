import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import LoginPage from './pages/LoginPage';
import MapPage   from './pages/MapPage';
import { isAuthenticated } from './services/authService';

function PrivateRoute({ children }) {
    return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/mapa"
                    element={
                        <PrivateRoute>
                            <MapPage />
                        </PrivateRoute>
                    }
                />
                {/* Redirige "/" según el estado de sesión */}
                <Route path="*" element={<Navigate to={isAuthenticated() ? '/mapa' : '/login'} replace />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);