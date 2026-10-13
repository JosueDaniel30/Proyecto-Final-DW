import { useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success(`¡Bienvenido de nuevo, ${data.name}!`);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 600);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="login-root">
      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className="login-nav">
        <div className="login-logo">
          <div className="login-logo-bar" />
          <div>
            <p className="login-logo-title">GALÁCTICOS</p>
            <p className="login-logo-sub">Mesa de Ayuda</p>
          </div>
        </div>
        <ul className="login-nav-links">
          <li>Inicio</li>
          <li>Servicios</li>
          <li>Nosotros</li>
          <li className="active">Login</li>
          <li>Contacto</li>
        </ul>
      </nav>

      {/* ── MAIN ────────────────────────────────────────────── */}
      <main className="login-main">
        {/* LEFT – Form */}
        <section className="login-form-side">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Bienvenido de nuevo, ingresa a tu cuenta.</p>
          <div className="login-title-bar" />

          <form onSubmit={handleLogin} className="login-form">
            {/* Email */}
            <div className="login-field">
              <label className="login-label">Correo Electrónico</label>
              <div className="login-input-wrap">
                <Mail className="login-input-icon" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@galacticos.com"
                  required
                  className="login-input"
                  id="login-email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label className="login-label">Contraseña</label>
              <div className="login-input-wrap">
                <Lock className="login-input-icon" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="login-input"
                  id="login-password"
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPassword((p) => !p)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="login-row-meta">
              <label className="login-remember">
                <input type="checkbox" id="remember-me" /> Recuérdame
              </label>
              <span className="login-forgot">¿Olvidaste tu contraseña?</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="login-btn-primary"
              id="login-submit"
            >
              {isLoading ? (
                <span className="login-spinner" />
              ) : (
                <>
                  INICIAR SESIÓN <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick accounts */}
          <div className="login-divider">
            <span>Cuentas de prueba rápida</span>
          </div>
          <div className="login-quick-accounts">
            <button
              type="button"
              className="quick-btn admin"
              onClick={() => fillCredentials('admin@galacticos.com', 'AdminPassword123!')}
            >
              <ShieldCheck size={14} /> Admin
            </button>
            <button
              type="button"
              className="quick-btn tech"
              onClick={() => fillCredentials('carlos.tecnico@galacticos.com', 'TechPassword123!')}
            >
              <Headphones size={14} /> Técnico
            </button>
            <button
              type="button"
              className="quick-btn client"
              onClick={() => fillCredentials('juan.cliente@empresa.com', 'ClientPassword123!')}
            >
              <CheckCircle2 size={14} /> Cliente
            </button>
          </div>
        </section>

        {/* RIGHT – Illustration */}
        <section className="login-illustration-side" aria-hidden="true">
          {/* Wave blob background */}
          <svg
            className="login-blob"
            viewBox="0 0 700 600"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0,600 L0,200 Q100,80 250,180 Q400,280 500,120 Q600,0 700,100 L700,600 Z"
              fill="url(#blobGrad)"
            />
            <defs>
              <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a8d8ea" />
                <stop offset="50%" stopColor="#6db8cc" />
                <stop offset="100%" stopColor="#3a8fa3" />
              </linearGradient>
            </defs>
          </svg>

          {/* SVG Illustration */}
          <svg
            className="login-scene"
            viewBox="0 0 520 420"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
          >
            {/* Plants */}
            <ellipse cx="80" cy="370" rx="30" ry="8" fill="#4caf7d" opacity="0.4" />
            <rect x="76" y="310" width="8" height="60" rx="4" fill="#6dbf8b" />
            <path d="M80 340 Q55 310 45 280 Q65 295 80 330" fill="#82c99e" />
            <path d="M80 340 Q105 310 115 280 Q95 295 80 330" fill="#6dbf8b" />
            <path d="M80 320 Q50 290 42 255 Q66 275 80 315" fill="#a0d9b4" />
            <path d="M80 320 Q110 290 118 255 Q94 275 80 315" fill="#82c99e" />

            {/* Vase */}
            <path d="M65 370 Q63 350 70 340 L90 340 Q97 350 95 370 Z" fill="#d1e8f0" />
            <ellipse cx="80" cy="370" rx="15" ry="5" fill="#b8d8e8" />

            {/* Second plant – small right */}
            <ellipse cx="390" cy="380" rx="18" ry="5" fill="#4caf7d" opacity="0.3" />
            <rect x="387" y="340" width="6" height="42" rx="3" fill="#6dbf8b" />
            <path d="M390 360 Q372 345 366 325 Q380 335 390 355" fill="#a0d9b4" />
            <path d="M390 360 Q408 345 414 325 Q400 335 390 355" fill="#82c99e" />

            {/* ── Person 1: sitting with tablet ── */}
            {/* body */}
            <ellipse cx="200" cy="290" rx="38" ry="20" fill="#f5c842" opacity="0.15" />
            {/* legs */}
            <path d="M175 280 Q165 310 155 330" stroke="#f0a04b" strokeWidth="14" strokeLinecap="round" />
            <path d="M195 285 Q192 315 185 335" stroke="#f0a04b" strokeWidth="12" strokeLinecap="round" />
            {/* torso */}
            <rect x="170" y="230" width="52" height="60" rx="20" fill="#f5c842" />
            {/* shirt detail */}
            <rect x="175" y="240" width="42" height="45" rx="16" fill="#f7d060" />
            {/* arms */}
            <path d="M170 250 Q145 260 140 280" stroke="#f5c842" strokeWidth="13" strokeLinecap="round" />
            <path d="M222 250 Q240 265 248 280" stroke="#f5c842" strokeWidth="13" strokeLinecap="round" />
            {/* tablet */}
            <rect x="145" y="270" width="58" height="40" rx="6" fill="#d1eaf5" stroke="#9ecfe8" strokeWidth="2" />
            <rect x="150" y="275" width="48" height="30" rx="4" fill="#e8f5ff" />
            <line x1="155" y1="282" x2="193" y2="282" stroke="#9ecfe8" strokeWidth="2" />
            <line x1="155" y1="289" x2="185" y2="289" stroke="#9ecfe8" strokeWidth="2" />
            <line x1="155" y1="296" x2="188" y2="296" stroke="#9ecfe8" strokeWidth="2" />
            {/* neck */}
            <rect x="187" y="215" width="18" height="20" rx="8" fill="#f5c09a" />
            {/* head */}
            <ellipse cx="196" cy="205" rx="24" ry="26" fill="#f5c09a" />
            {/* hair */}
            <path d="M172 198 Q175 170 196 168 Q217 170 220 198 Q215 185 196 183 Q177 185 172 198Z" fill="#4a2c0a" />
            <path d="M172 198 Q168 215 174 225" stroke="#4a2c0a" strokeWidth="7" strokeLinecap="round" />
            {/* eye */}
            <ellipse cx="188" cy="206" rx="3" ry="3.5" fill="#fff" />
            <ellipse cx="188" cy="206" rx="1.8" ry="2" fill="#3a1a00" />
            <ellipse cx="205" cy="206" rx="3" ry="3.5" fill="#fff" />
            <ellipse cx="205" cy="206" rx="1.8" ry="2" fill="#3a1a00" />
            {/* smile */}
            <path d="M190 216 Q196 221 202 216" stroke="#c0805a" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* ── Person 2: working at desk ── */}
            {/* desk */}
            <rect x="300" y="310" width="160" height="10" rx="5" fill="#b0ccd8" />
            <rect x="315" y="318" width="8" height="55" rx="4" fill="#9bbdcc" />
            <rect x="437" y="318" width="8" height="55" rx="4" fill="#9bbdcc" />
            {/* monitor */}
            <rect x="340" y="255" width="90" height="58" rx="6" fill="#d1eaf5" stroke="#9ecfe8" strokeWidth="2" />
            <rect x="346" y="261" width="78" height="46" rx="4" fill="#e8f5ff" />
            <line x1="352" y1="270" x2="418" y2="270" stroke="#9ecfe8" strokeWidth="2" />
            <line x1="352" y1="278" x2="405" y2="278" stroke="#9ecfe8" strokeWidth="2" />
            <line x1="352" y1="286" x2="410" y2="286" stroke="#9ecfe8" strokeWidth="2" />
            <line x1="352" y1="294" x2="400" y2="294" stroke="#9ecfe8" strokeWidth="2" />
            {/* monitor stand */}
            <rect x="381" y="311" width="8" height="10" rx="2" fill="#9bbdcc" />
            <rect x="373" y="319" width="24" height="4" rx="2" fill="#9bbdcc" />
            {/* person body */}
            <rect x="348" y="248" width="44" height="68" rx="18" fill="#e87c7c" />
            <rect x="354" y="256" width="34" height="55" rx="14" fill="#ee9090" />
            {/* arms typing */}
            <path d="M348 270 Q328 280 316 298" stroke="#e87c7c" strokeWidth="11" strokeLinecap="round" />
            <path d="M392 270 Q408 278 418 295" stroke="#e87c7c" strokeWidth="11" strokeLinecap="round" />
            {/* hands on desk */}
            <ellipse cx="316" cy="302" rx="9" ry="6" fill="#f5c09a" />
            <ellipse cx="418" cy="299" rx="9" ry="6" fill="#f5c09a" />
            {/* neck */}
            <rect x="362" y="233" width="16" height="18" rx="7" fill="#f5c09a" />
            {/* head */}
            <ellipse cx="370" cy="220" rx="22" ry="23" fill="#f5c09a" />
            {/* hair */}
            <path d="M348 215 Q352 192 370 190 Q388 192 392 215 Q386 200 370 198 Q354 200 348 215Z" fill="#2a1a5e" />
            {/* eye */}
            <ellipse cx="363" cy="221" rx="2.5" ry="3" fill="#fff" />
            <ellipse cx="363" cy="221" rx="1.5" ry="1.8" fill="#2a1a5e" />
            <ellipse cx="377" cy="221" rx="2.5" ry="3" fill="#fff" />
            <ellipse cx="377" cy="221" rx="1.5" ry="1.8" fill="#2a1a5e" />
            {/* smile */}
            <path d="M364 231 Q370 236 376 231" stroke="#c0805a" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Chair wheels */}
            <circle cx="340" cy="378" r="6" fill="#9bbdcc" />
            <circle cx="400" cy="382" r="6" fill="#9bbdcc" />
            <circle cx="460" cy="378" r="6" fill="#9bbdcc" />
            <path d="M340 378 Q370 370 400 382 Q430 388 460 378" stroke="#9bbdcc" strokeWidth="3" fill="none" />
            <rect x="368" y="340" width="24" height="38" rx="6" fill="#b0ccd8" />
          </svg>

          {/* Caption text */}
          <p className="login-illus-text">Plataforma de Gestión de Tickets · Galácticos S.A.</p>
        </section>
      </main>

      <style>{`
        /* ===== RESET / ROOT ===================================== */
        .login-root {
          min-height: 100vh;
          background: #f0f4f8;
          font-family: 'Inter', 'Plus Jakarta Sans', system-ui, sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ===== NAV ============================================== */
        .login-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 48px;
          background: #fff;
          box-shadow: 0 1px 0 rgba(0,0,0,0.06);
        }
        .login-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .login-logo-bar {
          width: 5px;
          height: 40px;
          background: #1a1a2e;
          border-radius: 3px;
        }
        .login-logo-title {
          font-weight: 800;
          font-size: 15px;
          letter-spacing: 1px;
          color: #1a1a2e;
          line-height: 1.1;
          margin: 0;
        }
        .login-logo-sub {
          font-size: 10px;
          color: #888;
          letter-spacing: 1px;
          margin: 0;
        }
        .login-nav-links {
          display: flex;
          gap: 32px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .login-nav-links li {
          font-size: 13px;
          font-weight: 500;
          color: #555;
          cursor: pointer;
          transition: color 0.2s;
        }
        .login-nav-links li:hover,
        .login-nav-links li.active {
          color: #3a8fa3;
        }

        /* ===== MAIN LAYOUT ====================================== */
        .login-main {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        /* ===== FORM SIDE ======================================== */
        .login-form-side {
          width: 420px;
          min-width: 320px;
          flex-shrink: 0;
          background: #fff;
          padding: 52px 48px 48px;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 30px rgba(0,0,0,0.06);
          z-index: 1;
        }

        .login-title {
          font-size: 38px;
          font-weight: 800;
          color: #1a1a2e;
          margin: 0 0 6px;
          line-height: 1;
          font-family: 'Space Grotesk', system-ui, sans-serif;
        }
        .login-subtitle {
          font-size: 13px;
          color: #888;
          margin: 0 0 12px;
        }
        .login-title-bar {
          width: 36px;
          height: 4px;
          background: #3a8fa3;
          border-radius: 2px;
          margin-bottom: 32px;
        }

        /* ===== FORM ============================================= */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .login-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .login-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: #3a8fa3;
        }
        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .login-input-icon {
          position: absolute;
          left: 12px;
          color: #aaa;
          pointer-events: none;
        }
        .login-input {
          width: 100%;
          padding: 11px 40px 11px 36px;
          border: 1.5px solid #dde3ea;
          border-radius: 8px;
          font-size: 13.5px;
          color: #333;
          background: #fafbfc;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .login-input::placeholder { color: #bbb; }
        .login-input:focus {
          border-color: #3a8fa3;
          box-shadow: 0 0 0 3px rgba(58,143,163,0.12);
          background: #fff;
        }
        .login-eye {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: #aaa;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .login-eye:hover { color: #3a8fa3; }

        .login-row-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 2px;
        }
        .login-remember {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #666;
          cursor: pointer;
        }
        .login-remember input { accent-color: #3a8fa3; cursor: pointer; }
        .login-forgot {
          font-size: 12px;
          color: #3a8fa3;
          cursor: pointer;
          font-weight: 500;
          transition: opacity 0.2s;
        }
        .login-forgot:hover { opacity: 0.75; }

        /* PRIMARY BUTTON */
        .login-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 24px;
          background: #1a1a2e;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          margin-top: 4px;
        }
        .login-btn-primary:hover:not(:disabled) {
          background: #3a8fa3;
          box-shadow: 0 8px 24px rgba(58,143,163,0.3);
          transform: translateY(-1px);
        }
        .login-btn-primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .login-spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* DIVIDER */
        .login-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 24px 0 14px;
          color: #bbb;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.5px;
        }
        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #eaecef;
        }

        /* QUICK ACCOUNTS */
        .login-quick-accounts {
          display: flex;
          gap: 10px;
        }
        .quick-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 8px 6px;
          border-radius: 8px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid transparent;
          transition: all 0.2s;
        }
        .quick-btn.admin {
          background: #eef0ff;
          color: #4a4fcf;
          border-color: #c7caff;
        }
        .quick-btn.admin:hover {
          background: #4a4fcf;
          color: #fff;
        }
        .quick-btn.tech {
          background: #e8f9f5;
          color: #0fa384;
          border-color: #b3eadf;
        }
        .quick-btn.tech:hover {
          background: #0fa384;
          color: #fff;
        }
        .quick-btn.client {
          background: #e8f5ff;
          color: #3a8fa3;
          border-color: #b3d9ea;
        }
        .quick-btn.client:hover {
          background: #3a8fa3;
          color: #fff;
        }

        /* ===== ILLUSTRATION SIDE ================================ */
        .login-illustration-side {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: #f0f4f8;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-blob {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .login-scene {
          position: relative;
          z-index: 1;
          width: min(520px, 90%);
          animation: floatScene 5s ease-in-out infinite alternate;
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.08));
        }
        @keyframes floatScene {
          from { transform: translateY(0px); }
          to   { transform: translateY(-12px); }
        }
        .login-illus-text {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          color: rgba(255,255,255,0.75);
          letter-spacing: 0.5px;
          white-space: nowrap;
          z-index: 2;
        }

        /* ===== RESPONSIVE ======================================= */
        @media (max-width: 768px) {
          .login-illustration-side { display: none; }
          .login-form-side {
            width: 100%;
            padding: 40px 24px;
          }
          .login-nav { padding: 14px 20px; }
          .login-nav-links { display: none; }
        }
      `}</style>
    </div>
  );
};

export default Login;
