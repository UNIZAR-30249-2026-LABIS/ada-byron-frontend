import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para inyectar el token JWT en cada petición
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

export async function getSpaces() {
    const response = await api.get('Spaces'); // http://localhost:5000/api/Spaces
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