import mongoose from 'mongoose';

let connectionPromise = null;

const connectDB = () => {
  if (mongoose.connection.readyState >= 1) return Promise.resolve();
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI)
      .then((conn) => {
        console.log(`MongoDB connected: ${conn.connection.host}`);
      })
      .catch((err) => {
        console.error(`MongoDB connection error: ${err.message}`);
        connectionPromise = null; // allow retry on next request if it failed
        throw err;
      });
  }
  return connectionPromise;
};

export default connectDB;