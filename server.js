const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('colors');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION 🔥! Shutting down gracefully...'.red.bold);
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './variables.env' });
const app = require('./app');

// db local
const dbLocal = process.env.DATABASE_LOCAL;

// atlas mongo uri
const mongoURI = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

const devEnv = process.env.NODE_ENV !== 'production';

mongoose
  .connect(`${devEnv ? dbLocal : mongoURI}`)
  .then(() =>
    console.log(`MongoDB Connected → ${devEnv ? dbLocal : mongoURI}`.gray.bold)
  );

app.set('port', process.env.PORT || 3333);

const server = app.listen(app.get('port'), () => {
  console.log(`App listening on port → ${server.address().port}`.blue.bold);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION 🔥! Shutting down gracefully...'.red.bold);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// SIGTERN causes a program to stop running so it doesn't need process.exit(1)
process.on('SIGTERM', () => {
  console.log('👏 SIGTERM RECEIVED!, Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated! 🔥');
  });
});
