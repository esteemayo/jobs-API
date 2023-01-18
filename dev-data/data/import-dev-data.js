import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import 'colors';

// models
import Job from '../../models/Job.js';
import User from '../../models/User.js';

dotenv.config({ path: './variables.env' });

// db local
const dbLocal = process.env.DATABASE_LOCAL;

// atlas mongo uri
const mongoURI = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

const devEnv = process.env.NODE_ENV !== 'production';

// MongoDB connection
mongoose
  .connect(`${devEnv ? dbLocal : mongoURI}`)
  .then(() =>
    console.log(`MongoDB Connected → ${devEnv ? dbLocal : mongoURI}`.gray.bold)
  )
  .catch((err) =>
    console.log(`Could not connect to MongoDB → ${err}`.red.bold)
  );

// read JSON file
const jobs = JSON.parse(fs.readFileSync(`${__dirname}/jobs.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

// import data into database
const importData = async () => {
  try {
    await Job.create(jobs);
    await User.create(users, { validaBeforeSave: false });
    console.log('👍👍👍👍👍👍👍👍 Done!'.green.bold);
    process.exit();
  } catch (e) {
    console.log(
      '\n👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n'
        .red.bold
    );
    console.log(e);
    process.exit();
  }
};

// delete data from database
const deleteData = async () => {
  try {
    console.log('😢😢 Goodbye Data...'.blue.bold);
    await Job.deleteMany();
    await User.deleteMany();
    console.log(
      'Data Deleted. To load sample data, run\n\n\t npm run sample\n\n'.green
        .bold
    );
    process.exit();
  } catch (e) {
    console.log(e);
    process.exit();
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
