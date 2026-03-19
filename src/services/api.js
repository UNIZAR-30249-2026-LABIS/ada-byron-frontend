// TODO: api.js — cliente HTTP para los endpoints REST de ada-byron-backend
// Base URL: import.meta.env.VITE_API_BASE_URL (default: http://localhost:5000)
// Funciones: getSpaces(), getReservations(), createReservation(data), approveReservation(id), rejectReservation(id, reason)
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
});

export async function createReservation(data) {
    const response = await api.post('/api/reservations', data);
    return response.data;
}

export default api;