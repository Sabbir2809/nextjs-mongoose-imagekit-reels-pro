import mongoose from "mongoose";

// Get MongoDB URL from environment variables
const MONGODB_URL = process.env.MONGODB_URL!;
if (!MONGODB_URL) {
  throw new Error("Please define MongoDB URL in .env file");
}

// Use global caching to prevent multiple connections in serverless environments
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = {
    connection: null,
    promise: null,
  };
}

// Function to connect to MongoDB
export async function connectToDatabase() {
  if (cached.connection) {
    return cached.connection; // Return existing connection if available
  }

  if (!cached.promise) {
    // Set connection options
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
    };

    // Create a new connection and store the promise
    cached.promise = mongoose.connect(MONGODB_URL, opts).then(() => mongoose.connection);
  }

  try {
    cached.connection = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached;
}
