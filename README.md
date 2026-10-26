# Vyntra — Stream Beyond

Vyntra is a full-stack video discovery and creator platform built with React, Vite, Node.js, Express, MongoDB, and Mongoose. Users can register, sign in, upload videos, browse/search by category, watch uploaded files, like videos, comment, and review their uploads in Creator Studio.

## Current capabilities

- Responsive dark interface with home feed, categories, search, and popular/latest sorting
- JWT authentication and bcrypt password hashing
- Protected video upload with Multer and a 500 MB upload limit
- MongoDB models for users, videos, and comments
- Video playback, view counts, likes, comments, and creator dashboard
- REST API, input checks, rate limiting, CORS configuration, and centralized errors

## Architecture

```text
React + Vite client (5173)
        │ REST / JSON + multipart upload
        ▼
Express API (5001) ───────── MongoDB Atlas
        │
        └── local uploads/ directory (development only)
```

**Important implementation boundary:** this starter currently saves original video files on the API server and marks them ready for playback. It does not yet implement FFmpeg transcoding, HLS renditions, resumable/chunked uploads, a BullMQ worker, S3, CloudFront, or real-time processing progress. Those are explicit next-stage engineering tasks, not features to claim as complete. Local disk storage is for development and is not durable or scalable deployment storage.

## Requirements

- Node.js 20 or newer
- npm
- A MongoDB Atlas database or local MongoDB instance
- Git (recommended)

## Run locally on macOS

### 1. Create a MongoDB database

Create a free development cluster in MongoDB Atlas, create a database user, and add your current IP address under Network Access. Copy the connection string. Replace the username, password, and database name placeholders. Avoid putting credentials in source code.

### 2. Configure the API

From the project root:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5001
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/vyntra
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Use a long, random secret for `JWT_SECRET`. If your database password contains special characters, URL-encode them in the connection string.

### 3. Install and run the API

In the `server` directory:

```bash
npm install
npm run dev
```

The API should be available at `http://localhost:5001`. Check `http://localhost:5001/api/health` for a health response.

### 4. Configure and run the frontend

Open a second terminal from the project root:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

### 5. Test the main flow

1. Create an account from **Sign in → Create an account**.
2. Open **Upload**, choose a small MP4/WebM video, add a title, category, and description, then publish.
3. Return to the home feed and open the uploaded video.
4. Test playback, view count, likes, and comments.
5. Open Creator Studio to see your uploads and aggregate views/likes.
6. Test search and category filters.

Start with a small video. A 500 MB maximum is a validation limit, not a recommendation for early testing. Local uploads are stored in `server/uploads/` and are intentionally excluded from Git.

## Useful API endpoints

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/api/health` | Health check | No |
| POST | `/api/auth/register` | Create account | No |
| POST | `/api/auth/login` | Sign in | No |
| GET | `/api/auth/me` | Current user | Yes |
| GET | `/api/videos?q=&category=&sort=` | Browse/search videos | No |
| GET | `/api/videos/:id` | Video metadata | No |
| POST | `/api/videos/upload` | Upload a video | Yes |
| GET | `/api/videos/mine` | Current user's uploads | Yes |
| POST | `/api/videos/:id/view` | Increment view count | No |
| POST | `/api/videos/:id/like` | Toggle like | Yes |
| GET | `/api/videos/:id/comments` | List comments | No |
| POST | `/api/videos/:id/comments` | Add comment | Yes |

For protected routes, send `Authorization: Bearer <token>`. The token is returned by login/register. The frontend attaches it automatically after login.

## Suggested implementation roadmap

1. **Reliable full-stack foundation:** verify auth, validation, search, uploads, comments, likes, and responsive layouts; add API tests and a seed script.
2. **Resumable large-file uploads:** upload sessions, chunk or multipart transfer, checksums, retry/resume behavior, and upload completion validation.
3. **Asynchronous processing:** Redis + BullMQ queue, separate worker process, FFmpeg transcoding to 360p/480p/720p HLS, thumbnail extraction, retry limits, dead-letter handling, and status/progress reporting.
4. **Production media storage:** private S3 bucket, presigned upload URLs, CloudFront delivery, origin protection, and cache headers.
5. **Scale-oriented product features:** buffered/deduplicated view events, batched database writes, watch history, playlists, subscriptions, creator analytics, and recommendation queries.
6. **Deployment:** deploy the client and API separately, deploy the worker in an FFmpeg-capable container, configure environment variables and durable object storage, then test a real large upload and adaptive playback.

## Production notes

This is a development starter, not a hardened public video service. Before public deployment, add request validation with a schema library, stricter per-route rate limits, secure cookie/token strategy appropriate to the deployment, upload quotas, malware/content moderation, authorization checks for private resources, robust logging, automated tests, and object storage. Never commit `.env` files or real user uploads.

## Suggested GitHub description

**Vyntra — a full-stack video discovery and creator platform with React, Express, MongoDB, and a planned asynchronous media-processing pipeline.**
