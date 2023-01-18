import 'colors';

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION 🔥! Shutting down gracefully...'.red.bold);
  console.log(err.name, err.message);
  process.exit(1);
});

import app from './app.js';
import connectDB from './config/db.js';

app.set('port', process.env.PORT || 3333);

const server = app.listen(app.get('port'), async () => {
  await connectDB();
  console.log(`App listening on port → ${server.address().port}`.blue.bold);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION 🔥! Shutting down gracefully...'.red.bold);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👏 SIGTERM RECEIVED!, Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated! 🔥');
  });
});
