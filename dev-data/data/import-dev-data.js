import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import 'colors';

// models
import Job from '../../models/Job.js';
import User from '../../models/User.js';
import connectDB from '../../config/db.js';

dotenv.config({ path: './variables.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
connectDB();

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
