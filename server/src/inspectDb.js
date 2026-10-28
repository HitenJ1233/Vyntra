import 'dotenv/config';
import { connectDB, closeDB } from './config/db.js';
import User from './models/User.js';
import Video from './models/Video.js';
import Comment from './models/Comment.js';

async function inspect() {
  await connectDB();

  const [users, videos, comments] = await Promise.all([
    User.find({}).sort({ createdAt: -1 }),
    Video.find({}).populate('owner', 'name email').sort({ createdAt: -1 }),
    Comment.find({}).populate('user', 'name email').populate('video', 'title').sort({ createdAt: -1 }),
  ]);

  console.log(`\n👥 REGISTERED USERS (${users.length})`);
  if (users.length === 0) {
    console.log('  No registered users found.');
  } else {
    console.table(users.map(u => ({
      ID: String(u._id),
      Name: u.name,
      Email: u.email,
      'Joined At': new Date(u.createdAt).toLocaleString(),
    })));
  }

  console.log(`\n🎬 VIDEOS (${videos.length})`);
  if (videos.length === 0) {
    console.log('  No videos published yet.');
  } else {
    console.table(videos.map(v => ({
      ID: String(v._id),
      Title: v.title.length > 35 ? v.title.slice(0, 32) + '...' : v.title,
      Category: v.category,
      Creator: v.owner?.name || 'Unknown',
      Views: v.viewCount,
      Likes: v.likes?.length || 0,
      Status: v.status,
    })));
  }

  console.log(`\n💬 COMMENTS (${comments.length})`);
  if (comments.length === 0) {
    console.log('  No comments yet.');
  } else {
    console.table(comments.map(c => ({
      ID: String(c._id),
      Author: c.user?.name || 'Unknown',
      Video: c.video?.title ? (c.video.title.length > 25 ? c.video.title.slice(0, 22) + '...' : c.video.title) : 'Unknown',
      Comment: c.body.length > 40 ? c.body.slice(0, 37) + '...' : c.body,
      'Posted At': new Date(c.createdAt).toLocaleString(),
    })));
  }

  await closeDB();
  process.exit(0);
}

inspect().catch(err => {
  console.error('Inspection error:', err);
  process.exit(1);
});
