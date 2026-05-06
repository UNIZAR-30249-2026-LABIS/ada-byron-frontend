import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: inyecta el JWT en cada petición
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('ada_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor: si el servidor devuelve 401 (token caducado o inválido),
// limpia la sesión y redirige al login automáticamente.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('ada_token');
            localStorage.removeItem('ada_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export async function getSpaces() {
    const response = await api.get('Spaces');
    return response.data;
}

export async function getReservations() {
    const response = await api.get('reservations');
    return response.data;
}

export async function createReservation(data) {
    const response = await api.post('reservations', data);
    return response.data;
}

export default api;
