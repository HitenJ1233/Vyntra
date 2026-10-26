import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Auth from './pages/Auth';
import UploadPage from './pages/Upload';
import Watch from './pages/Watch';
import Studio from './pages/Studio';
import { AuthProvider } from './context/AuthContext';
import './styles.css';

function AppContent() {
  const [search,setSearch] = useState(''); const location = useLocation(); const sortFromUrl = new URLSearchParams(location.search).get('sort') || 'latest';
  return <Layout search={search} setSearch={setSearch} onSearch={() => {}}><Routes><Route path="/" element={<Home search={search} sortFromUrl={sortFromUrl}/>} /><Route path="/login" element={<Auth mode="login"/>}/><Route path="/signup" element={<Auth mode="signup"/>}/><Route path="/upload" element={<UploadPage/>}/><Route path="/watch/:id" element={<Watch/>}/><Route path="/studio" element={<Studio/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></Layout>;
}
export default function App() { return <BrowserRouter><AuthProvider><AppContent/></AuthProvider></BrowserRouter>; }
