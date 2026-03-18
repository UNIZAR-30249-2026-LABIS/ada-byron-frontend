import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, saveSession } from '../../services/authService';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        const targetEmail = email.trim();
        if (!targetEmail) return;

        setLoading(true);
        setError('');

        try {
            const data = await login(targetEmail);
            saveSession(data);
            navigate('/mapa');
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Usuario no registrado en el sistema.');
            } else {
                setError('Error de conexión. Inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <label
                    htmlFor="email-input"
                    className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                    Correo institucional
                </label>
                <input
                    id="email-input"
                    type="email"
                    required
                    placeholder="NIP@unizar.es"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50
                               text-gray-900 text-sm placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
                               disabled:opacity-50 transition-all"
                />
            </div>

            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                    <span className="text-red-500 text-xs font-medium">{error}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl
                           hover:bg-gray-700 active:scale-[0.98]
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-150"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Verificando...
                    </span>
                ) : 'Iniciar Sesión'}
            </button>
        </form>
    );
}
