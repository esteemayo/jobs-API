import express  from 'express';
import morgan  from 'morgan';
import cors  from 'cors';
import helmet  from 'helmet';
import rateLimit  from 'express-rate-limit';
import mongoSanitize  from 'express-mongo-sanitize';
import xss  from 'xss-clean';
import hpp  from 'hpp';
import compression  from 'compression';
import swaggerUi  from 'swagger-ui-express';
import YAML  from 'yamljs';
import cookieParser  from 'cookie-parser';

const swaggerDocument = YAML.load('./swagger.yaml');

// routes
import jobRouter  from './routes/jobs.js';
import userRouter  from './routes/users.js';
import NotFoundError  from './errors/notFound.js';
import globalErrorHandler  from './controllers/errorControllers.js';

// start express app
const app = express();

// global middlewares
app.set('trust proxy', 1);

// implement CORS
app.use(cors());
// access-control-allow-origin
app.options('*', cors());

// set security HTTP headers
app.use(helmet());

// development logging
if (app.get('env') === 'development') {
  app.use(morgan('dev'));
}

// limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Please try again in an hour!',
});

app.use('/api', limiter);

// body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// cookie parser middleware
app.use(cookieParser(process.env.COOKIE_SECRET));

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data sanitization against XSS
app.use(xss());

// prevent parameter pollution
app.use(hpp());

// compression middleware
app.use(compression());

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.cookies);

  next();
});

// swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send('<h1>Jobs API</h1><a href="/api-docs">Documentation</a>');
});

// api routes
app.use('/api/v1/jobs', jobRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server`));
});

app.use(globalErrorHandler);

export default app;
