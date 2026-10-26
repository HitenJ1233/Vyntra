import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: '', maxlength: 3000 },
  category: { type: String, default: 'Other', index: true },
  tags: [{ type: String, trim: true }],
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, default: '' },
  originalName: { type: String, default: '' },
  mimeType: { type: String, default: '' },
  sizeBytes: { type: Number, default: 0 },
  status: { type: String, enum: ['uploaded', 'processing', 'ready', 'failed'], default: 'ready', index: true },
  viewCount: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  publishedAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

videoSchema.index({ title: 'text', description: 'text', tags: 'text' });
export default mongoose.model('Video', videoSchema);
