import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Eye, Film, Plus, UploadCloud } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatViews, timeAgo } from '../components/VideoCard';

export default function Studio() {
  const {user,authLoading} = useAuth(); const navigate = useNavigate(); const [videos,setVideos] = useState([]); const [loading,setLoading] = useState(true); const [error,setError] = useState('');
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login', { state: { from: '/studio' } }); return; }
    api.get('/videos/mine')
      .then(({ data }) => setVideos(data.videos))
      .catch(e => {
        if (e.response?.status === 401) {
          navigate('/login', { state: { from: '/studio' } });
          return;
        }
        setError(e.response?.data?.message || 'Could not load your videos.');
      })
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);
  const views = videos.reduce((sum,v) => sum + (v.viewCount || 0),0); const likes = videos.reduce((sum,v) => sum + (v.likes?.length || 0),0);
  return <div className="page-wrap studio-page"><div className="studio-header"><div><div className="eyebrow muted">CREATOR STUDIO / OVERVIEW</div><h1>Your corner.<br/><span>Your audience.</span></h1><p>Make things people want to come back to.</p></div><Link to="/upload" className="primary-button"><Plus size={17}/> New upload <ArrowUpRight size={16}/></Link></div><div className="stats-grid"><div className="stat-card"><span><Film size={17}/> PUBLISHED VIDEOS</span><strong>{videos.length}</strong><small>All your uploads in one place</small></div><div className="stat-card"><span><Eye size={17}/> TOTAL VIEWS</span><strong>{formatViews(views)}</strong><small>Across your videos</small></div><div className="stat-card"><span>♡ TOTAL LIKES</span><strong>{formatViews(likes)}</strong><small>Audience engagement</small></div></div><section className="studio-videos"><div className="section-heading"><div><div className="eyebrow muted">YOUR LIBRARY</div><h2>Published videos</h2></div><Link to="/upload" className="text-link">Upload another ↗</Link></div>{loading ? <div className="empty-state"><div className="loader"/></div> : error ? <div className="form-error">{error}</div> : videos.length ? <div className="studio-list">{videos.map(v => <div className="studio-row" key={v._id}><div className="studio-thumb"><Film size={22}/></div><div className="studio-video-copy"><b>{v.title}</b><small>{v.category} · {timeAgo(v.createdAt)}</small></div><span className={`status-pill status-${v.status}`}>{v.status}</span><span className="studio-row-views"><Eye size={15}/>{formatViews(v.viewCount)}</span><Link to={`/watch/${v._id}`} className="row-link">View ↗</Link></div>)}</div> : <div className="studio-empty"><div className="empty-icon"><UploadCloud size={24}/></div><h3>One upload changes everything.</h3><p>Your videos, views, and channel activity will show up here.</p><Link className="primary-button" to="/upload">Upload your first video <ArrowUpRight size={16}/></Link></div>}</section></div>;
}
