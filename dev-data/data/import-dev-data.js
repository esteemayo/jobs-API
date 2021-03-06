const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
require('colors');

// models
const Job = require('../../models/Job');
const User = require('../../models/User');

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
    console.log(`MongoDB Connected ā ${devEnv ? dbLocal : mongoURI}`.gray.bold)
  )
  .catch((err) =>
    console.log(`Could not connect to MongoDB ā ${err}`.red.bold)
  );

// read JSON file
const jobs = JSON.parse(fs.readFileSync(`${__dirname}/jobs.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

// import data into database
const importData = async () => {
  try {
    await Job.create(jobs);
    await User.create(users, { validaBeforeSave: false });
    console.log('šššššššš Done!'.green.bold);
    process.exit();
  } catch (e) {
    console.log(
      '\nšššššššš Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n'
        .red.bold
    );
    console.log(e);
    process.exit();
  }
};

// delete data from database
const deleteData = async () => {
  try {
    console.log('š¢š¢ Goodbye Data...'.blue.bold);
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
