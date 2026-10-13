import { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import {
  LayoutDashboard,
  Ticket as TicketIcon,
  LogOut,
  PlusCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  User,
  Send,
  Search,
  RefreshCw,
  ChevronDown,
  Menu,
  X,
  TrendingUp,
  Layers,
  ShieldCheck,
} from 'lucide-react';

/* ── Tiny SVG Sparkline ───────────────────────────────────────────── */
const Sparkline = ({ values = [], color = '#6366f1', fill = 'rgba(99,102,241,0.15)' }) => {
  if (!values.length) return null;
  const w = 80, h = 32;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(' ');
  const area = `M0,${h} L${pts.split(' ').map(p => p).join(' L')} L${w},${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <path d={area} fill={fill} />
      <polyline points={pts} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ── Donut ring ───────────────────────────────────────────────────── */
const DonutRing = ({ pct = 0, color = '#6366f1', size = 52, stroke = 6 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fill="white" fontSize="11" fontWeight="700">{pct}%</text>
    </svg>
  );
};

/* ── Main Component ────────────────────────────────────────────────── */
const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Media');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  /* ── API calls ── */
  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/tickets');
      setTickets(data);
    } catch {
      toast.error('Error al obtener la lista de tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.warning('Por favor completa todos los campos');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/tickets', { title, description, priority });
      toast.success('Ticket creado y enviado a la cola de RabbitMQ');
      setTitle(''); setDescription(''); setPriority('Media');
      setShowForm(false);
      fetchTickets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear el ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/tickets/${id}/status`, { status });
      toast.success(`Estado actualizado a: ${status}`);
      fetchTickets();
    } catch {
      toast.error('Error al actualizar estado del ticket');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  /* ── Derived data ── */
  const filteredTickets = useMemo(() => tickets.filter(t => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      t.title.toLowerCase().includes(s) ||
      t.description.toLowerCase().includes(s) ||
      t.client?.name?.toLowerCase().includes(s) ||
      (t.technician?.name && t.technician.name.toLowerCase().includes(s));
    const matchStatus = statusFilter === 'Todos' || t.status === statusFilter;
    return matchSearch && matchStatus;
  }), [tickets, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: tickets.length,
    pendientes: tickets.filter(t => t.status === 'Pendiente').length,
    enProgreso: tickets.filter(t => t.status === 'En Progreso').length,
    resueltos: tickets.filter(t => t.status === 'Resuelto').length,
  }), [tickets]);

  const resolvedPct = stats.total ? Math.round((stats.resueltos / stats.total) * 100) : 0;

  /* Fake sparkline data based on real counts */
  const makeSparkline = (peak) => {
    const rand = (n) => Math.max(0, n + Math.round((Math.random() - 0.5) * n * 0.6));
    return [rand(peak * 0.5), rand(peak * 0.7), rand(peak * 0.6), rand(peak * 0.9), rand(peak * 0.8), peak];
  };

  /* ── Helpers ── */
  const priorityStyle = (p) => {
    if (p === 'Alta') return { bg: '#fee2e2', color: '#dc2626', dot: '#ef4444' };
    if (p === 'Media') return { bg: '#fef9c3', color: '#ca8a04', dot: '#eab308' };
    return { bg: '#d1fae5', color: '#059669', dot: '#10b981' };
  };

  const statusStyle = (s) => {
    if (s === 'Pendiente')   return { bg: '#fef9c3', color: '#b45309', dot: '#f59e0b' };
    if (s === 'En Progreso') return { bg: '#ede9fe', color: '#6d28d9', dot: '#8b5cf6' };
    if (s === 'Resuelto')    return { bg: '#d1fae5', color: '#065f46', dot: '#10b981' };
    return { bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' };
  };

  const getRoleColor = (role) => {
    if (role === 'Administrador') return '#7c3aed';
    if (role === 'Técnico') return '#0891b2';
    return '#2563eb';
  };

  const canCreate = user?.role === 'Cliente' || user?.role === 'Administrador';
  const canEdit   = user?.role === 'Técnico' || user?.role === 'Administrador';
  const listLabel = user?.role === 'Cliente' ? 'Mis Solicitudes'
    : user?.role === 'Técnico' ? 'Tickets Asignados' : 'Gestión Global de Tickets';

  /* ── Nav items ── */
  const navItems = [
    { icon: <LayoutDashboard size={17} />, label: 'Dashboard', active: true },
    { icon: <TicketIcon size={17} />, label: 'Tickets', active: false },
    { icon: <Layers size={17} />, label: 'Cola RabbitMQ', active: false },
    { icon: <ShieldCheck size={17} />, label: 'Administración', active: false },
    { icon: <TrendingUp size={17} />, label: 'Reportes', active: false },
  ];

  /* ────────────────────────────────────────────────────────────────── */
  return (
    <div className="db-root">

      {/* ── SIDEBAR ── */}
      <aside className={`db-sidebar ${sidebarOpen ? 'db-sidebar--open' : ''}`}>
        {/* Logo */}
        <div className="db-sb-logo">
          <div className="db-sb-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="white" opacity=".9" />
              <polygon points="12,6 18,9.5 18,16.5 12,20 6,16.5 6,9.5" fill="#1e293b" />
              <circle cx="12" cy="13" r="2.5" fill="white" />
            </svg>
          </div>
          <div>
            <p className="db-sb-logo-name">Galácticos</p>
            <p className="db-sb-logo-sub">Mesa de Ayuda</p>
          </div>
        </div>

        {/* Section label */}
        <p className="db-sb-section">DASHBOARD &amp; APPS</p>

        {/* Nav */}
        <nav className="db-sb-nav">
          {navItems.map((item, i) => (
            <div key={i} className={`db-sb-item ${item.active ? 'db-sb-item--active' : ''}`}>
              {item.icon}
              <span>{item.label}</span>
              {item.active && <ChevronDown size={14} className="db-sb-chevron" />}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <button className="db-sb-logout" onClick={handleLogout}>
          <LogOut size={16} /> Cerrar Sesión
        </button>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="db-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── RIGHT PANEL ── */}
      <div className="db-content">

        {/* ── TOPBAR ── */}
        <header className="db-topbar">
          <button className="db-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>

          <div className="db-topbar-search">
            <Search size={14} className="db-search-icon" />
            <input placeholder="Buscar tickets, usuarios..." className="db-search-input" />
          </div>

          <div className="db-topbar-right">
            <button
              onClick={fetchTickets}
              title="Actualizar"
              className="db-icon-btn"
            >
              <RefreshCw size={16} className={isLoading ? 'db-spin' : ''} />
            </button>

            {/* User pill */}
            <div className="db-user-pill">
              <div className="db-avatar" style={{ background: getRoleColor(user?.role) }}>
                {user?.name?.charAt(0) || <User size={14} />}
              </div>
              <div className="db-user-info">
                <p className="db-user-name">{user?.name}</p>
                <p className="db-user-role">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── MAIN ── */}
        <main className="db-main">

          {/* Page heading */}
          <div className="db-page-head">
            <div>
              <h1 className="db-page-title">Panel de Control</h1>
              <p className="db-page-sub">Monitoreo en tiempo real · Galácticos S.A.</p>
            </div>
            {canCreate && (
              <button className="db-btn-new" onClick={() => setShowForm(v => !v)}>
                {showForm ? <X size={15} /> : <PlusCircle size={15} />}
                {showForm ? 'Cancelar' : 'Nuevo Ticket'}
              </button>
            )}
          </div>

          {/* ── STAT CARDS ── */}
          <div className="db-stats-grid">
            {/* Total */}
            <div className="db-stat-card">
              <div className="db-stat-top">
                <div>
                  <p className="db-stat-label">Total Tickets</p>
                  <p className="db-stat-value">{stats.total}</p>
                  <p className="db-stat-trend up">+{stats.total} registrados</p>
                </div>
                <div className="db-stat-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>
                  <TicketIcon size={20} />
                </div>
              </div>
              <div className="db-stat-spark">
                <Sparkline values={makeSparkline(stats.total)} color="#6366f1" fill="rgba(99,102,241,0.12)" />
              </div>
            </div>

            {/* Pendientes */}
            <div className="db-stat-card">
              <div className="db-stat-top">
                <div>
                  <p className="db-stat-label">Pendientes</p>
                  <p className="db-stat-value">{stats.pendientes}</p>
                  <p className="db-stat-trend warn">En cola de atención</p>
                </div>
                <div className="db-stat-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                  <Clock size={20} />
                </div>
              </div>
              <div className="db-stat-spark">
                <Sparkline values={makeSparkline(stats.pendientes)} color="#f59e0b" fill="rgba(245,158,11,0.12)" />
              </div>
            </div>

            {/* En Progreso */}
            <div className="db-stat-card">
              <div className="db-stat-top">
                <div>
                  <p className="db-stat-label">En Progreso</p>
                  <p className="db-stat-value">{stats.enProgreso}</p>
                  <p className="db-stat-trend info">Atendidos activamente</p>
                </div>
                <div className="db-stat-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>
                  <RefreshCw size={20} />
                </div>
              </div>
              <div className="db-stat-spark">
                <Sparkline values={makeSparkline(stats.enProgreso)} color="#8b5cf6" fill="rgba(139,92,246,0.12)" />
              </div>
            </div>

            {/* Resueltos + donut */}
            <div className="db-stat-card db-stat-card--accent">
              <div className="db-stat-top">
                <div>
                  <p className="db-stat-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Resueltos</p>
                  <p className="db-stat-value" style={{ color: '#fff' }}>{stats.resueltos}</p>
                  <p className="db-stat-trend" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Tasa de resolución
                  </p>
                </div>
                <DonutRing pct={resolvedPct} color="#34d399" size={56} stroke={5} />
              </div>
              <div style={{ marginTop: 4 }}>
                <div className="db-progress-bar">
                  <div className="db-progress-fill" style={{ width: `${resolvedPct}%` }} />
                </div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                  {resolvedPct}% completado
                </p>
              </div>
            </div>
          </div>

          {/* ── CREATE TICKET FORM ── */}
          {canCreate && showForm && (
            <div className="db-card db-form-card">
              <div className="db-card-head">
                <div className="db-card-head-icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                  <PlusCircle size={18} />
                </div>
                <div>
                  <h2 className="db-card-title">Crear Nuevo Ticket de Soporte</h2>
                  <p className="db-card-sub">Los tickets ingresan automáticamente a la cola RabbitMQ para asignación técnica.</p>
                </div>
              </div>

              <form onSubmit={handleCreateTicket} className="db-form">
                <div className="db-form-row">
                  <div className="db-form-group db-form-group--wide">
                    <label className="db-form-label">Título del Incidente o Requerimiento</label>
                    <input
                      type="text"
                      placeholder="Ej. Error de conexión en el módulo de facturación"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                      className="db-form-input"
                      id="ticket-title"
                    />
                  </div>
                  <div className="db-form-group">
                    <label className="db-form-label">Prioridad</label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value)}
                      className="db-form-input"
                      id="ticket-priority"
                    >
                      <option value="Baja">Baja</option>
                      <option value="Media">Media</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </div>
                </div>

                <div className="db-form-group">
                  <label className="db-form-label">Descripción Detallada</label>
                  <textarea
                    rows="3"
                    placeholder="Describe lo ocurrido, pasos para reproducir o detalles del equipo..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    className="db-form-input db-form-textarea"
                    id="ticket-description"
                  />
                </div>

                <div className="db-form-footer">
                  <button
                    type="button"
                    className="db-btn-ghost"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="db-btn-submit"
                    id="ticket-submit"
                  >
                    {isSubmitting ? (
                      <span className="db-spin-inline" />
                    ) : (
                      <><Send size={14} /> Registrar Ticket</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── TICKETS TABLE ── */}
          <div className="db-card">
            <div className="db-card-head db-card-head--between">
              <div className="db-card-head-left">
                <div className="db-card-head-icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                  <TicketIcon size={18} />
                </div>
                <div>
                  <h2 className="db-card-title">{listLabel}</h2>
                  <p className="db-card-sub">Monitoreo en tiempo real de requerimientos y estados.</p>
                </div>
              </div>

              <div className="db-filters">
                <div className="db-search-wrap">
                  <Search size={13} className="db-search-icon2" />
                  <input
                    type="text"
                    placeholder="Buscar tickets..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="db-filter-input"
                    id="ticket-search"
                  />
                </div>

                <div className="db-select-wrap">
                  <Filter size={13} />
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="db-filter-select"
                    id="ticket-filter-status"
                  >
                    <option value="Todos">Todos</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Progreso">En Progreso</option>
                    <option value="Resuelto">Resuelto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Cliente</th>
                    <th>Técnico Asignado</th>
                    {canEdit && <th className="db-th-right">Actualizar Estado</th>}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="db-td-empty">
                        <span className="db-loading-ring" />
                        Cargando tickets...
                      </td>
                    </tr>
                  ) : filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => {
                      const ps = priorityStyle(ticket.priority);
                      const ss = statusStyle(ticket.status);
                      return (
                        <tr key={ticket._id} className="db-tr">
                          <td className="db-td db-td-ticket">
                            <p className="db-ticket-title">{ticket.title}</p>
                            <p className="db-ticket-desc">{ticket.description}</p>
                          </td>
                          <td className="db-td">
                            <span className="db-badge" style={{ background: ps.bg, color: ps.color }}>
                              <span className="db-dot" style={{ background: ps.dot }} />
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="db-td">
                            <span className="db-badge" style={{ background: ss.bg, color: ss.color }}>
                              <span className="db-dot" style={{ background: ss.dot }} />
                              {ticket.status}
                            </span>
                          </td>
                          <td className="db-td">
                            <div className="db-user-cell">
                              <div className="db-avatar-sm" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                                {ticket.client?.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="db-cell-name">{ticket.client?.name || 'Desconocido'}</p>
                                <p className="db-cell-email">{ticket.client?.email || ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="db-td">
                            {ticket.technician ? (
                              <div className="db-user-cell">
                                <div className="db-avatar-sm" style={{ background: '#ede9fe', color: '#6d28d9' }}>
                                  {ticket.technician.name?.charAt(0)}
                                </div>
                                <div>
                                  <p className="db-cell-name">{ticket.technician.name}</p>
                                  <p className="db-cell-email">{ticket.technician.email}</p>
                                </div>
                              </div>
                            ) : (
                              <span className="db-queue-label">
                                <Clock size={12} style={{ color: '#f59e0b' }} />
                                En cola...
                              </span>
                            )}
                          </td>
                          {canEdit && (
                            <td className="db-td db-td-right">
                              <select
                                value={ticket.status}
                                onChange={e => handleUpdateStatus(ticket._id, e.target.value)}
                                className="db-status-select"
                              >
                                <option value="Pendiente">Pendiente</option>
                                <option value="En Progreso">En Progreso</option>
                                <option value="Resuelto">Resuelto</option>
                                <option value="Archivado">Archivado</option>
                              </select>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="db-td-empty">
                        <AlertCircle size={28} style={{ color: '#cbd5e1', marginBottom: 6 }} />
                        No se encontraron tickets con los filtros actuales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredTickets.length > 0 && (
              <div className="db-table-footer">
                Mostrando <b>{filteredTickets.length}</b> de <b>{tickets.length}</b> tickets
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── STYLES ── */}
      <style>{`
        /* ===== ROOT ============================================== */
        .db-root {
          display: flex;
          min-height: 100vh;
          background: #f1f5f9;
          font-family: 'Inter', 'Plus Jakarta Sans', system-ui, sans-serif;
          color: #1e293b;
        }

        /* ===== SIDEBAR ========================================== */
        .db-sidebar {
          width: 240px;
          min-height: 100vh;
          background: #1e293b;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          position: fixed;
          left: 0; top: 0; bottom: 0;
          z-index: 50;
          transition: transform 0.28s cubic-bezier(.4,0,.2,1);
        }
        @media (max-width: 900px) {
          .db-sidebar { transform: translateX(-100%); }
          .db-sidebar.db-sidebar--open { transform: translateX(0); }
        }

        .db-sb-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 22px 20px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .db-sb-logo-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #6366f1, #06b6d4);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .db-sb-logo-name {
          font-size: 15px; font-weight: 800; color: #fff; margin: 0; line-height: 1.1;
          letter-spacing: 0.3px;
        }
        .db-sb-logo-sub {
          font-size: 10px; color: rgba(255,255,255,0.4); margin: 0; letter-spacing: 0.5px;
        }

        .db-sb-section {
          font-size: 9.5px;
          letter-spacing: 1.2px;
          color: rgba(255,255,255,0.3);
          font-weight: 700;
          padding: 18px 20px 8px;
          margin: 0;
        }

        .db-sb-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 10px;
          flex: 1;
        }
        .db-sb-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.55);
          cursor: pointer;
          transition: all 0.18s;
          user-select: none;
        }
        .db-sb-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); }
        .db-sb-item--active {
          background: rgba(99,102,241,0.18);
          color: #a5b4fc;
          font-weight: 600;
        }
        .db-sb-chevron { margin-left: auto; opacity: 0.6; }

        .db-sb-logout {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 10px 10px 20px;
          padding: 10px 12px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 500;
          color: #fca5a5;
          background: rgba(239,68,68,0.08);
          border: none;
          cursor: pointer;
          transition: background 0.18s;
          width: calc(100% - 20px);
        }
        .db-sb-logout:hover { background: rgba(239,68,68,0.16); }

        .db-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 40;
        }

        /* ===== CONTENT ========================================== */
        .db-content {
          flex: 1;
          margin-left: 240px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        @media (max-width: 900px) { .db-content { margin-left: 0; } }

        /* ===== TOPBAR ========================================== */
        .db-topbar {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 0 24px;
          height: 60px;
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          position: sticky; top: 0; z-index: 30;
        }
        .db-menu-btn {
          display: none;
          background: none; border: none;
          color: #64748b; cursor: pointer; padding: 4px;
        }
        @media (max-width: 900px) { .db-menu-btn { display: flex; } }

        .db-topbar-search {
          flex: 1;
          position: relative;
          max-width: 340px;
        }
        .db-search-icon {
          position: absolute;
          left: 11px; top: 50%; transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }
        .db-search-input {
          width: 100%;
          padding: 8px 12px 8px 32px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          color: #334155;
          background: #f8fafc;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .db-search-input:focus { border-color: #6366f1; background: #fff; }
        .db-search-input::placeholder { color: #cbd5e1; }

        .db-topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
        }
        .db-icon-btn {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          color: #64748b;
          cursor: pointer;
          transition: all 0.18s;
        }
        .db-icon-btn:hover { border-color: #6366f1; color: #6366f1; }

        .db-user-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 12px 5px 6px;
          border-radius: 30px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
        }
        .db-avatar {
          width: 30px; height: 30px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .db-user-info {}
        .db-user-name { font-size: 12px; font-weight: 600; color: #1e293b; margin: 0; line-height: 1.2; }
        .db-user-role { font-size: 10px; color: #94a3b8; margin: 0; }

        /* ===== MAIN ============================================= */
        .db-main {
          padding: 28px 28px 48px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        @media (max-width: 640px) { .db-main { padding: 18px 14px 40px; } }

        .db-page-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .db-page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; font-family: 'Space Grotesk', system-ui, sans-serif; }
        .db-page-sub { font-size: 12px; color: #94a3b8; margin: 2px 0 0; }

        .db-btn-new {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 18px;
          background: linear-gradient(135deg, #6366f1, #06b6d4);
          color: #fff;
          border: none; border-radius: 10px;
          font-size: 13px; font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(99,102,241,0.3);
          transition: all 0.2s;
          white-space: nowrap;
        }
        .db-btn-new:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.4); }

        /* ===== STAT CARDS ======================================= */
        .db-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 1100px) { .db-stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px)  { .db-stats-grid { grid-template-columns: 1fr; } }

        .db-stat-card {
          background: #fff;
          border-radius: 14px;
          padding: 18px 20px 14px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s;
        }
        .db-stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .db-stat-card--accent {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          border-color: transparent;
        }
        .db-stat-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }
        .db-stat-label { font-size: 11px; font-weight: 600; letter-spacing: 0.5px; color: #94a3b8; margin: 0 0 6px; text-transform: uppercase; }
        .db-stat-value { font-size: 30px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1; font-family: 'Space Grotesk', system-ui, sans-serif; }
        .db-stat-trend { font-size: 11px; margin: 4px 0 0; font-weight: 500; }
        .db-stat-trend.up   { color: #10b981; }
        .db-stat-trend.warn { color: #f59e0b; }
        .db-stat-trend.info { color: #8b5cf6; }
        .db-stat-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .db-stat-spark { margin-top: 12px; }

        .db-progress-bar {
          height: 5px;
          background: rgba(255,255,255,0.12);
          border-radius: 99px;
          overflow: hidden;
          margin-top: 12px;
        }
        .db-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #34d399, #10b981);
          border-radius: 99px;
          transition: width 0.6s ease;
        }

        /* ===== CARD ============================================= */
        .db-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .db-form-card { padding: 24px; }
        .db-card-head {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 20px 24px 16px;
          border-bottom: 1px solid #f1f5f9;
        }
        .db-card-head--between {
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .db-card-head-left { display: flex; align-items: flex-start; gap: 12px; }
        .db-card-head-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .db-card-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 2px; font-family: 'Space Grotesk', system-ui, sans-serif; }
        .db-card-sub { font-size: 11.5px; color: #94a3b8; margin: 0; }

        /* ===== FORM ============================================= */
        .db-form { display: flex; flex-direction: column; gap: 14px; margin-top: 16px; }
        .db-form-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 14px;
        }
        @media (max-width: 640px) { .db-form-row { grid-template-columns: 1fr; } }
        .db-form-group--wide {}
        .db-form-group { display: flex; flex-direction: column; gap: 5px; }
        .db-form-label { font-size: 11px; font-weight: 600; color: #475569; letter-spacing: 0.3px; text-transform: uppercase; }
        .db-form-input {
          padding: 9px 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 9px;
          font-size: 13.5px;
          color: #1e293b;
          background: #f8fafc;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .db-form-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); background: #fff; }
        .db-form-textarea { resize: vertical; min-height: 78px; }
        .db-form-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; }
        .db-btn-ghost {
          padding: 9px 18px;
          border: 1.5px solid #e2e8f0;
          border-radius: 9px;
          font-size: 13px; font-weight: 600;
          color: #64748b;
          background: transparent;
          cursor: pointer;
          transition: all 0.18s;
        }
        .db-btn-ghost:hover { border-color: #94a3b8; color: #334155; }
        .db-btn-submit {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 22px;
          background: linear-gradient(135deg, #6366f1, #06b6d4);
          color: #fff;
          border: none; border-radius: 9px;
          font-size: 13px; font-weight: 600;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(99,102,241,0.3);
          transition: all 0.2s;
        }
        .db-btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(99,102,241,0.4); }
        .db-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ===== FILTERS ========================================== */
        .db-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .db-search-wrap { position: relative; }
        .db-search-icon2 {
          position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
          color: #94a3b8; pointer-events: none;
        }
        .db-filter-input {
          padding: 7px 10px 7px 28px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 12.5px; color: #334155;
          background: #f8fafc; outline: none;
          transition: border-color 0.2s;
          width: 185px;
        }
        .db-filter-input:focus { border-color: #6366f1; background: #fff; }
        .db-select-wrap {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 10px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
          color: #64748b; font-size: 12.5px;
        }
        .db-filter-select {
          background: transparent; border: none; outline: none;
          color: #334155; font-size: 12.5px; cursor: pointer;
        }

        /* ===== TABLE ============================================ */
        .db-table-wrap { overflow-x: auto; }
        .db-table {
          width: 100%;
          border-collapse: collapse;
        }
        .db-table thead tr {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .db-table th {
          padding: 11px 16px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: #64748b;
          white-space: nowrap;
          text-align: left;
        }
        .db-th-right { text-align: right; }
        .db-tr { transition: background 0.15s; }
        .db-tr:hover { background: #f8fafc; }
        .db-tr + .db-tr { border-top: 1px solid #f1f5f9; }
        .db-td { padding: 13px 16px; font-size: 13px; color: #334155; vertical-align: middle; }
        .db-td-ticket { max-width: 280px; }
        .db-td-right { text-align: right; }
        .db-td-empty {
          text-align: center;
          padding: 48px 16px;
          color: #94a3b8;
          font-size: 13px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .db-ticket-title { font-weight: 600; color: #0f172a; margin: 0; font-size: 13px; }
        .db-ticket-desc  {
          color: #94a3b8; font-size: 11.5px; margin: 3px 0 0;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }

        .db-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 11.5px; font-weight: 600;
          white-space: nowrap;
        }
        .db-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .db-user-cell { display: flex; align-items: center; gap: 8px; }
        .db-avatar-sm {
          width: 28px; height: 28px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700;
          flex-shrink: 0;
        }
        .db-cell-name  { font-size: 12.5px; font-weight: 600; color: #1e293b; margin: 0; }
        .db-cell-email { font-size: 11px; color: #94a3b8; margin: 0; }

        .db-queue-label {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; color: #94a3b8; font-style: italic;
        }

        .db-status-select {
          padding: 6px 10px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 12px; color: #334155;
          background: #f8fafc; outline: none;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .db-status-select:hover { border-color: #6366f1; }
        .db-status-select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }

        .db-table-footer {
          padding: 12px 20px;
          border-top: 1px solid #f1f5f9;
          font-size: 12px;
          color: #94a3b8;
          text-align: right;
        }
        .db-table-footer b { color: #475569; }

        /* ===== ANIMATIONS ======================================= */
        .db-spin { animation: dbSpin 0.8s linear infinite; }
        @keyframes dbSpin { to { transform: rotate(360deg); } }

        .db-spin-inline {
          display: inline-block;
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: dbSpin 0.7s linear infinite;
        }

        .db-loading-ring {
          display: inline-block;
          width: 22px; height: 22px;
          border: 2.5px solid #e2e8f0;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: dbSpin 0.8s linear infinite;
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
