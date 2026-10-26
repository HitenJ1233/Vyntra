import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { protect } from '../middleware/auth.js';
import { listVideos, getVideo, uploadVideo, toggleLike, addView, listComments, addComment, myVideos } from '../controllers/videoController.js';
const router = Router();
const storage = multer.diskStorage({
  destination: path.resolve('uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) cb(null, true); else cb(new Error('Only video files are accepted.'));
} });
router.get('/', listVideos);
router.get('/mine', protect, myVideos);
router.post('/upload', protect, upload.single('video'), uploadVideo);
router.get('/:id/comments', listComments);
router.post('/:id/comments', protect, addComment);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/view', addView);
router.get('/:id', getVideo);
export default router;
