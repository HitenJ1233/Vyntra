import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('vyntra_user')); } catch { return null; } });
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem('vyntra_token')));
  useEffect(() => {
    if (!localStorage.getItem('vyntra_token')) { setAuthLoading(false); return; }
    api.get('/auth/me').then(({ data }) => { setUser(data.user); localStorage.setItem('vyntra_user', JSON.stringify(data.user)); }).catch(() => { localStorage.removeItem('vyntra_token'); localStorage.removeItem('vyntra_user'); setUser(null); }).finally(() => setAuthLoading(false));
  }, []);
  const acceptSession = data => { localStorage.setItem('vyntra_token', data.token); localStorage.setItem('vyntra_user', JSON.stringify(data.user)); setUser(data.user); };
  const logout = () => { localStorage.removeItem('vyntra_token'); localStorage.removeItem('vyntra_user'); setUser(null); };
  return <AuthContext.Provider value={{ user, authLoading, acceptSession, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
