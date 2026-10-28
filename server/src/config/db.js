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
    console.log('Using local persistent MongoDB instance for development...');
  }

  const dbPath = path.resolve(__dirname, '../../../server/.mongo-data');
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  const activeUriFile = path.resolve(dbPath, 'active_uri.txt');

  // 2. Check if a local instance is already running from another process
  if (fs.existsSync(activeUriFile)) {
    try {
      const activeUri = fs.readFileSync(activeUriFile, 'utf8').trim();
      if (activeUri) {
        await mongoose.connect(activeUri, { serverSelectionTimeoutMS: 2000 });
        console.log(`Connected to existing local MongoDB instance at: ${mongoose.connection.host}`);
        return;
      }
    } catch {
      try { fs.unlinkSync(activeUriFile); } catch {}
    }
  }

  // 3. Start local persistent embedded MongoDB with self-healing lock cleanup
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  
  try {
    embeddedMongoServer = await MongoMemoryServer.create({
      instance: {
        dbPath,
        storageEngine: 'wiredTiger',
      },
    });
  } catch (err) {
    if (err.message && (err.message.includes('DBPathInUse') || err.message.includes('lock file') || err.message.includes('initAndListen'))) {
      console.warn('Stale MongoDB lock detected. Recovering...');
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
          dbPath,
          storageEngine: 'wiredTiger',
        },
      });
    } else {
      throw err;
    }
  }

  const embeddedUri = embeddedMongoServer.getUri() + 'vyntra';
  fs.writeFileSync(activeUriFile, embeddedUri, 'utf8');

  await mongoose.connect(embeddedUri);
  console.log(`MongoDB connected (Local persistent instance): ${mongoose.connection.host}`);
  console.log(`Database storage location: ${dbPath}`);
  console.log('To connect to MongoDB Atlas, set MONGODB_URI in server/.env');
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
