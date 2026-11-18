'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLiga } from '@/hooks/useLiga';
import { resumenPartido } from '@/lib/clasificacion';
import { fechaPartido } from '@/lib/fechas';
import Login from '@/components/admin/Login';
import AjustesAdmin from '@/components/admin/AjustesAdmin';
import ParejasAdmin from '@/components/admin/ParejasAdmin';
import PartidosAdmin from '@/components/admin/PartidosAdmin';
import CopiaAdmin from '@/components/admin/CopiaAdmin';

const PESTANAS = ['Resumen', 'Ajustes', 'Parejas y jugadores', 'Jornadas y partidos', 'Copia de seguridad'];

function Resumen({ liga }) {
  const { parejas, jugadores, jornadas, partidos, filas } = liga;
  const nombres = new Map(parejas.map((p) => [p.id, p.nombre]));
  const jugados = partidos.filter((p) => p.estado === 'jugado');
  const lider = filas.find((f) => f.pj > 0);
  const ultimos = [...jugados].sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0)).slice(0, 10);
  return (
    <>
      <dl className="cifras cifras-admin">
        <div><dt>Parejas activas</dt><dd>{parejas.filter((p) => p.activa).length}</dd></div>
        <div><dt>Jugadores</dt><dd>{jugadores.length}</dd></div>
        <div><dt>Jornadas</dt><dd>{jornadas.length}</dd></div>
        <div><dt>Partidos jugados</dt><dd>{jugados.length}/{partidos.length}</dd></div>
        <div><dt>Aplazados</dt><dd>{partidos.filter((p) => p.estado === 'aplazado').length}</dd></div>
      </dl>
      <div className="panel-caja">
        <h2>Estado de la competición</h2>
        <p>{lider ? `Líder: ${lider.nombre} con ${lider.puntos} puntos.` : 'Todavía no hay resultados.'}</p>
      </div>
      <div className="panel-caja">
        <h2>Historial reciente</h2>
        {ultimos.length === 0 ? <p className="vacio">Aún no hay partidos jugados.</p> : (
          <ul className="historial">
            {ultimos.map((p) => {
              const r = resumenPartido(p);
              const j = jornadas.find((x) => x.id === p.jornada_id);
              return (
                <li key={p.id} className="gana">
                  <span className="insignia">J{j?.numero}</span>
                  <span className="hist-datos"><strong>{nombres.get(p.pareja_a)} vs {nombres.get(p.pareja_b)}</strong><small>{r.sets.map((s) => `${s.juegos_a}-${s.juegos_b}`).join('  ')} · {fechaPartido(p.fecha)}</small></span>
                  <span className="hist-marcador">{r.sa}-{r.sb}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

function Panel({ sesion }) {
  const liga = useLiga();
  const [pestana, setPestana] = useState(0);
  const [aviso, setAviso] = useState(null);
  const avisar = useCallback((texto, tipo = 'ok') => {
    setAviso({ texto, tipo });
    setTimeout(() => setAviso((a) => (a && a.texto === texto ? null : a)), 5000);
  }, []);

  return (
    <div className="contenedor pagina">
      <div className="admin-cab">
        <h1 className="titulo-pagina">Administración</h1>
        <span className="admin-usuario">{sesion.user.email}
          <button className="btn btn-suave" onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>
        </span>
      </div>
      <div className="pestanas" role="tablist">
        {PESTANAS.map((p, i) => (
          <button key={p} role="tab" aria-selected={i === pestana} className={i === pestana ? 'pestana activa' : 'pestana'} onClick={() => setPestana(i)}>{p}</button>
        ))}
      </div>
      {aviso && <p className={aviso.tipo === 'error' ? 'msg-error' : 'msg-ok'} role="status">{aviso.texto}</p>}
      {liga.error && <p className="msg-error" role="alert">{liga.error}</p>}
      {liga.cargando ? <p className="aviso">Cargando…</p> : (
        <>
          {pestana === 0 && <Resumen liga={liga} />}
          {pestana === 1 && liga.ajustes && <AjustesAdmin key={JSON.stringify(liga.ajustes)} ajustes={liga.ajustes} avisar={avisar} refrescar={liga.recargar} />}
          {pestana === 2 && <ParejasAdmin parejas={liga.parejas} jugadores={liga.jugadores} avisar={avisar} refrescar={liga.recargar} />}
          {pestana === 3 && <PartidosAdmin jornadas={liga.jornadas} partidos={liga.partidos} parejas={liga.parejas} avisar={avisar} refrescar={liga.recargar} />}
          {pestana === 4 && <CopiaAdmin avisar={avisar} />}
        </>
      )}
    </div>
  );
}

export default function Admin() {
  const [sesion, setSesion] = useState(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSesion(s));
    return () => data.subscription.unsubscribe();
  }, []);
  if (sesion === undefined) return <div className="contenedor pagina"><p className="aviso">Cargando…</p></div>;
  if (!sesion) return <Login />;
  return <Panel sesion={sesion} />;
}
