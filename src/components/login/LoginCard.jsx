import LoginForm from './LoginForm';

export default function LoginCard() {
    return (
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-gray-200/80 px-8 py-10 flex flex-col gap-6">

            {/* ── Logo ── */}
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl font-bold tracking-tight">AB</span>
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Bienvenido
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                        Gestiona tus espacios inteligentes<br />
                        con el acceso Ada Byron.
                    </p>
                </div>
            </div>

            {/* ── Formulario ── */}
            <LoginForm />

            {/* ── Footer ── */}
            <p className="text-center text-[11px] text-gray-400">
                © 2024 Universidad de Zaragoza · Ada Byron
            </p>

        </div>
    );
}
