import { Link } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { mediaUrl } from '../lib/api';

const gradients = ['thumb-purple','thumb-blue','thumb-orange','thumb-green'];
export function formatViews(value = 0) { return new Intl.NumberFormat('en', { notation: value >= 1000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(value); }
export function timeAgo(value) { const diff = Math.max(0, Date.now() - new Date(value).getTime()); const days = Math.floor(diff / 86400000); if (days < 1) return 'Today'; if (days === 1) return '1 day ago'; if (days < 30) return `${days} days ago`; if (days < 365) return `${Math.floor(days / 30)} months ago`; return `${Math.floor(days / 365)} years ago`; }
export default function VideoCard({ video, index = 0 }) {
  return <article className="video-card"><Link to={`/watch/${video._id}`} className={`thumbnail ${gradients[index % gradients.length]}`}>
    {video.thumbnailUrl ? <img src={mediaUrl(video.thumbnailUrl)} alt=""/> : <div className="thumb-art"><span className="thumb-orbit"/><span className="thumb-glyph">{video.category === 'Music' ? '♫' : video.category === 'Gaming' ? '⌘' : video.category === 'Technology' ? '⌁' : '◈'}</span><span className="thumb-category">{video.category || 'VYNTRA ORIGINAL'}</span></div>}
    <span className="duration">{video.durationSec ? `${Math.floor(video.durationSec / 60)}:${String(video.durationSec % 60).padStart(2,'0')}` : 'VIDEO'}</span>
  </Link><div className="video-meta"><div className="creator-avatar">{video.owner?.name?.charAt(0).toUpperCase() || 'V'}</div><div className="video-copy"><Link to={`/watch/${video._id}`} className="video-title">{video.title}</Link><div className="creator-name">{video.owner?.name || 'Vyntra creator'}</div><div className="video-stats">{formatViews(video.viewCount)} views <span>·</span> {timeAgo(video.publishedAt || video.createdAt)}</div></div><button className="more-button" aria-label="More options"><MoreHorizontal size={19}/></button></div></article>;
}
