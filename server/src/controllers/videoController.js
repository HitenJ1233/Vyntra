import Video from '../models/Video.js';
import Comment from '../models/Comment.js';

const populateOwner = { path: 'owner', select: 'name avatarUrl' };

export async function listVideos(req, res, next) {
  try {
    const { q, category, sort = 'latest', page = 1, limit = 12 } = req.query;
    const filter = { status: 'ready' };
    if (category && category !== 'All') filter.category = category;
    if (q?.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { tags: { $regex: escaped, $options: 'i' } }
      ];
    }
    const sortBy = sort === 'popular' ? { viewCount: -1, publishedAt: -1 } : { publishedAt: -1 };
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(24, Math.max(1, Number(limit) || 12));
    const [videos, total] = await Promise.all([
      Video.find(filter).populate(populateOwner).sort(sortBy).skip((safePage - 1) * safeLimit).limit(safeLimit),
      Video.countDocuments(filter)
    ]);
    res.json({ videos, page: safePage, pages: Math.ceil(total / safeLimit), total });
  } catch (e) { next(e); }
}

export async function getVideo(req, res, next) {
  try {
    const video = await Video.findById(req.params.id).populate(populateOwner);
    if (!video) return res.status(404).json({ message: 'Video not found.' });
    res.json({ video });
  } catch (e) { next(e); }
}

export async function uploadVideo(req, res, next) {
  try {
    const { title, description = '', category = 'Other', tags = '' } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Choose a video file to upload.' });
    if (!title?.trim()) return res.status(400).json({ message: 'A video title is required.' });
    const video = await Video.create({
      owner: req.user._id, title: title.trim(), description, category,
      tags: String(tags).split(',').map(t => t.trim()).filter(Boolean).slice(0, 15),
      videoUrl: `/uploads/${req.file.filename}`, originalName: req.file.originalname,
      mimeType: req.file.mimetype, sizeBytes: req.file.size, status: 'ready'
    });
    await video.populate(populateOwner);
    res.status(201).json({ message: 'Video published.', video });
  } catch (e) { next(e); }
}

export async function toggleLike(req, res, next) {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found.' });
    const index = video.likes.findIndex(id => id.equals(req.user._id));
    if (index >= 0) video.likes.splice(index, 1); else video.likes.push(req.user._id);
    await video.save();
    res.json({ liked: index < 0, likeCount: video.likes.length });
  } catch (e) { next(e); }
}

export async function addView(req, res, next) {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }, { new: true }).select('viewCount');
    if (!video) return res.status(404).json({ message: 'Video not found.' });
    res.json({ viewCount: video.viewCount });
  } catch (e) { next(e); }
}

export async function listComments(req, res, next) {
  try {
    const comments = await Comment.find({ video: req.params.id }).populate('user', 'name avatarUrl').sort({ createdAt: -1 }).limit(100);
    res.json({ comments });
  } catch (e) { next(e); }
}

export async function addComment(req, res, next) {
  try {
    const body = req.body.body?.trim();
    if (!body) return res.status(400).json({ message: 'Comment cannot be empty.' });
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found.' });
    const comment = await Comment.create({ video: video._id, user: req.user._id, body, parent: req.body.parent || null });
    await comment.populate('user', 'name avatarUrl');
    res.status(201).json({ comment });
  } catch (e) { next(e); }
}

export async function myVideos(req, res, next) {
  try {
    const videos = await Video.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ videos });
  } catch (e) { next(e); }
}
