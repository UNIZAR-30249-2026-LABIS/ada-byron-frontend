import axios from 'axios';

const api = axios.create({
    // Sincronización con el puerto 5000 del backend Ada Byron
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

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