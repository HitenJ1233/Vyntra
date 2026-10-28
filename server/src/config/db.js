import mongoose from 'mongoose';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let embeddedMongoServer = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI?.trim();
  const isPlaceholder = !uri || uri.includes('YOUR_USER') || uri.includes('YOUR_PASSWORD') || uri.includes('YOUR_CLUSTER');

  // 1. Try external MONGODB_URI if specified
  if (!isPlaceholder) {
    try {
      console.log('Connecting to MongoDB via MONGODB_URI...');
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.warn(`Could not connect to external MONGODB_URI (${err.message}).`);
      console.warn('Falling back to local persistent embedded MongoDB instance...');
    }
  } else {
    console.log('No external MONGODB_URI configured in server/.env.');
    console.log('Using local persistent MongoDB instance on fixed port 27017...');
  }

  const FIXED_PORT = Number(process.env.LOCAL_MONGO_PORT) || 27017;
  const defaultLocalUri = `mongodb://127.0.0.1:${FIXED_PORT}/vyntra`;
  const dbPath = path.resolve(__dirname, '../../../server/.mongo-data');
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  // 2. Check if a local instance is already running on port 27017
  try {
    await mongoose.connect(defaultLocalUri, { serverSelectionTimeoutMS: 1200 });
    console.log(`MongoDB connected: Existing local instance on port ${FIXED_PORT}`);
    return;
  } catch {
    // Port 27017 not currently running, proceed to launch instance
  }

  // 3. Start local persistent embedded MongoDB on fixed port 27017
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  
  try {
    embeddedMongoServer = await MongoMemoryServer.create({
      instance: {
        port: FIXED_PORT,
        dbPath,
        storageEngine: 'wiredTiger',
      },
    });
  } catch (err) {
    if (err.message && (err.message.includes('DBPathInUse') || err.message.includes('lock file') || err.message.includes('initAndListen') || err.message.includes('EADDRINUSE'))) {
      console.warn('Stale MongoDB lock/process detected. Recovering...');
      try {
        const { execSync } = await import('node:child_process');
        execSync('pkill -9 mongod 2>/dev/null || true');
        const lockPath = path.resolve(dbPath, 'mongod.lock');
        if (fs.existsSync(lockPath)) {
          fs.unlinkSync(lockPath);
        }
      } catch {}
      embeddedMongoServer = await MongoMemoryServer.create({
        instance: {
          port: FIXED_PORT,
          dbPath,
          storageEngine: 'wiredTiger',
        },
      });
    } else {
      throw err;
    }
  }

  const embeddedUri = embeddedMongoServer.getUri() + 'vyntra';
  const activeUriFile = path.resolve(dbPath, 'active_uri.txt');
  fs.writeFileSync(activeUriFile, embeddedUri, 'utf8');

  await mongoose.connect(embeddedUri);
  console.log(`MongoDB connected (Fixed local port): mongodb://127.0.0.1:${FIXED_PORT}/vyntra`);
  console.log(`Database storage location: ${dbPath}`);
  console.log('MongoDB Compass connection: mongodb://127.0.0.1:27017/vyntra');
}

export async function closeDB() {
  try {
    const dbPath = path.resolve(__dirname, '../../../server/.mongo-data');
    const activeUriFile = path.resolve(dbPath, 'active_uri.txt');
    await mongoose.disconnect();
    if (embeddedMongoServer) {
      if (fs.existsSync(activeUriFile)) {
        try { fs.unlinkSync(activeUriFile); } catch {}
      }
      await embeddedMongoServer.stop();
      embeddedMongoServer = null;
    }
  } catch (err) {
    console.error('Error closing database connection:', err);
  }
}
