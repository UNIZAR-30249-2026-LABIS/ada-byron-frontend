import axios from 'axios';

const API_BASE = '/api';

/**
 * Autenticación passwordless: envía el email al backend.
 * Si el usuario existe → { token, email, nombreCompleto, rol }
 * Si no existe → lanza error 401
 */
export async function login(email) {
    const response = await axios.post(`${API_BASE}/Auth/login`, { email });
    return response.data;
}

export function saveSession(authData) {
    localStorage.setItem('ada_token', authData.token);
    localStorage.setItem('ada_user', JSON.stringify({
        email:          authData.email,
        nombreCompleto: authData.nombreCompleto,
        rol:            authData.rol,
    }));
}

export function getToken()        { return localStorage.getItem('ada_token'); }
export function getUser()         { const r = localStorage.getItem('ada_user'); return r ? JSON.parse(r) : null; }
export function logout()          { localStorage.removeItem('ada_token'); localStorage.removeItem('ada_user'); }
export function isAuthenticated() { return !!getToken(); }
