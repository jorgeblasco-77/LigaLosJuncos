'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setEnviando(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password: clave });
    if (error) setError('Email o contraseña incorrectos.');
    setEnviando(false);
  }

  return (
    <div className="contenedor pagina">
      <form className="login" onSubmit={entrar}>
        <h1>Panel de administración</h1>
        <p className="nota">Acceso privado de la organización de la liga.</p>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" /></label>
        <label>Contraseña<input type="password" value={clave} onChange={(e) => setClave(e.target.value)} required autoComplete="current-password" /></label>
        {error && <p className="msg-error" role="alert">{error}</p>}
        <button className="btn btn-primario" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </div>
  );
}
