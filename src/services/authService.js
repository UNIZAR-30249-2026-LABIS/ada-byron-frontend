import api from './api';

// Mapeo de índices de enum a nombres de rol (coincide con el enum Rol.cs del backend)
const ROL_NAMES = ['Estudiante', 'TecnicoLab', 'Docente', 'Conserje', 'Gerente'];

/**
 * Normaliza el rol: si el backend manda un entero (ej: 4), lo convierte al nombre ("Gerente").
 * Si ya es string, lo devuelve tal cual.
 */
function normalizeRol(rol) {
    if (typeof rol === 'number') return ROL_NAMES[rol] ?? String(rol);
    if (typeof rol === 'string' && /^\d+$/.test(rol)) return ROL_NAMES[parseInt(rol, 10)] ?? rol;
    return rol;
}

/**
 * Autenticación passwordless: envía el email al backend.
 * Si el usuario existe → { token, email, nombreCompleto, rol }
 * Si no existe → lanza error 401
 */
export async function login(email) {
    const response = await api.post('Auth/login', { email });
    return response.data;
}

export function saveSession(authData) {
    localStorage.setItem('ada_token', authData.token);
    localStorage.setItem('ada_user', JSON.stringify({
        email: authData.email,
        nombreCompleto: authData.nombreCompleto,
        rol: normalizeRol(authData.rol),   // siempre almacena el nombre en string
    }));
}

export function getToken() { return localStorage.getItem('ada_token'); }
export function getUser() { const r = localStorage.getItem('ada_user'); return r ? JSON.parse(r) : null; }
export function logout() { localStorage.removeItem('ada_token'); localStorage.removeItem('ada_user'); }
export function isAuthenticated() { return !!getToken(); }
