import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: './variables.env' });

const devEnv = process.env.NODE_ENV !== 'production';
const { DATABASE, DATABASE_LOCAL, DATABASE_PASSWORD } = process.env;

// db local
const dbLocal = DATABASE_LOCAL;

// atlas mongo uri
const mongoURI = DATABASE.replace('<PASSWORD>', DATABASE_PASSWORD);

const db = devEnv ? dbLocal : mongoURI;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(db);
    console.log(`MongoDB Connected → ${conn.connection.port}`.gray.bold);
  } catch (err) {
    throw err
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected'.strikethrough);
});

export default connectDB;
