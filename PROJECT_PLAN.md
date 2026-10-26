# Vyntra Build Plan

## Build and verify now
- [ ] Install dependencies and connect MongoDB
- [ ] Register/login/logout
- [ ] Upload a small video and confirm a MongoDB Video document is created
- [ ] Browse, search, and filter videos
- [ ] Play a video and confirm the view count changes
- [ ] Add a comment and toggle a like
- [ ] Confirm Creator Studio lists the signed-in user's uploads
- [ ] Test empty states, failed API calls, and mobile layout
- [ ] Push source to GitHub without `.env` or uploaded media

## Architecture to add next
- [ ] Replace API-server disk upload with direct multipart object-storage upload
- [ ] Add an upload session model and idempotent upload-completion endpoint
- [ ] Add Redis/BullMQ and a separate FFmpeg worker
- [ ] Track `uploaded -> processing -> ready/failed` with retry and failure details
- [ ] Generate 360p/480p/720p HLS playlists and segments plus thumbnails
- [ ] Store originals and renditions in private S3; serve through CloudFront
- [ ] Add progress polling or Socket.IO events
- [ ] Buffer view events in Redis and batch database writes
- [ ] Add watch history, playlists, subscriptions, analytics, and tests

Do not describe the later-stage items as completed until they are implemented and tested.
