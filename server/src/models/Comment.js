import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true, trim: true, maxlength: 1000 },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);
