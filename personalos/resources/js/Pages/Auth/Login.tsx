import React, { FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Login" />

            <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
                {/* Noise Overlay */}
                <div className="noise-overlay"></div>

                {/* Mist Gradient */}
                <div className="absolute top-0 left-0 w-full h-[50vh] bg-mist-gradient pointer-events-none"></div>

                <div className="relative z-10 w-full max-w-md px-6">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-white text-black rounded-sm flex items-center justify-center font-bold text-3xl mb-4">
                            武
                        </div>
                        <h1 className="font-display font-bold text-2xl tracking-[0.2em] uppercase text-white">
                            Musha Shugyo
                        </h1>
                        <span className="text-[11px] text-white/30 font-mono mt-1">
                            OS v1.0 // AUTHENTICATE
                        </span>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={submit} className="stealth-card p-8">
                        <div className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2"
                                >
                                    EMAIL
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full bg-[#050505] border border-white/10 rounded-[2px] px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-white/20"
                                    placeholder="operator@domain.com"
                                    autoComplete="email"
                                    autoFocus
                                />
                                {errors.email && (
                                    <p className="mt-2 text-xs text-red-400 font-mono">{errors.email}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2"
                                >
                                    PASSWORD
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full bg-[#050505] border border-white/10 rounded-[2px] px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-white/20"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                {errors.password && (
                                    <p className="mt-2 text-xs text-red-400 font-mono">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center gap-3">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 bg-[#050505] border border-white/10 rounded-[2px] text-emerald-500 focus:ring-emerald-500/50"
                                />
                                <label
                                    htmlFor="remember"
                                    className="text-xs font-mono text-white/40"
                                >
                                    MAINTAIN SESSION
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold font-display text-sm uppercase tracking-wider py-3 rounded-[2px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        AUTHENTICATING...
                                    </>
                                ) : (
                                    'ENTER SYSTEM'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-[10px] text-white/20 font-mono mt-6">
                        SOVEREIGN ACCESS ONLY // UNAUTHORIZED ACCESS PROHIBITED
                    </p>
                </div>
            </div>
        </>
    );
}
