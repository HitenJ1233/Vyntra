import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Compass, Clapperboard, House, Search, Upload, UserRound, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children, search, setSearch, onSearch }) {
  const { user, logout } = useAuth(); const navigate = useNavigate(); const [mobileOpen, setMobileOpen] = useState(false);
  const leave = () => { logout(); navigate('/'); };
  return <div className="app-shell">
    <header className="topbar"><Link to="/" className="brand"><span className="brand-mark">v</span><span>vyntra<span className="brand-dot">.</span></span></Link>
      <form className="searchbar" onSubmit={e => { e.preventDefault(); onSearch?.(); navigate('/'); }}><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search videos, creators, topics"/><kbd>↵</kbd></form>
      <div className="top-actions"><Link to="/upload" className="upload-button"><Upload size={16}/><span>Upload</span></Link>{user ? <button className="avatar" title={user.name} onClick={() => navigate('/studio')}>{user.name?.charAt(0).toUpperCase()}</button> : <Link className="signin-button" to="/login">Sign in</Link>}<button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">{mobileOpen ? <X/> : <Menu/>}</button></div>
    </header>
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}><div className="side-label">DISCOVER</div><NavLink end to="/" onClick={() => setMobileOpen(false)}><House size={18}/>Home</NavLink><NavLink to="/?sort=popular" onClick={() => setMobileOpen(false)}><Compass size={18}/>Trending</NavLink><NavLink to="/studio" onClick={() => setMobileOpen(false)}><Clapperboard size={18}/>Creator studio</NavLink><div className="side-divider"/><div className="side-label">YOUR SPACE</div>{user ? <><NavLink to="/upload" onClick={() => setMobileOpen(false)}><Upload size={18}/>Upload video</NavLink><button className="side-button" onClick={leave}><LogOut size={18}/>Sign out</button></> : <NavLink to="/login" onClick={() => setMobileOpen(false)}><UserRound size={18}/>Sign in</NavLink>}<div className="sidebar-bottom"><div className="sidebar-note"><span className="live-dot"/> Your next favourite is out there.</div><small>© 2026 Vyntra Studio</small></div></aside>
    <main className="main-content">{children}</main>
  </div>;
}
